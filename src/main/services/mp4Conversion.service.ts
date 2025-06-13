import * as fs from "fs/promises";
import * as path from "path";
import ffmpeg from "fluent-ffmpeg";
import { getMainWindow } from "../mainWindowManager";
import * as videoDataHelpers from "./video.helpers";
import { deleteFile } from "./file.service";
import * as videoDbDataService from "./videoDbData.service";
import { normalizeFilePath } from "./helpers";
import { ConversionQueueItem } from "../../models/conversion-queue-item.model";
import * as conversionQueueDataService from "./conversionQueueDataDb.service";

const VIDEO_EXTENSIONS = new Set([
  ".mkv",
  ".avi",
  ".mov",
  ".wmv",
  ".flv",
  ".webm",
  ".mpg",
  ".mpeg",
  ".3gp",
]);
const CHECK_QUEUE_INTERVAL_MS = 1000;

interface ConversionProgress {
  percent?: number;
  frames?: number;
  currentFps?: number;
  currentKbps?: number;
  targetSize?: number;
  timemark?: string;
}

class ConversionQueue {
  private queue: ConversionQueueItem[] = [];
  private isProcessing = false;
  private currentProcessingItem: ConversionQueueItem | null = null;
  private currentFFmpegProcess: ffmpeg.FfmpegCommand | null = null;
  private progressIntervalMs = 2000;

  constructor(
    private processor: (
      queueItem: ConversionQueueItem,
      queue: ConversionQueue,
      progressIntervalMs: number,
    ) => Promise<void>,
  ) {}

  async initializeProcessing() {
    await this.loadQueue();
    this.processQueue();
  }

  private async loadQueue() {
    const savedQueue =
      (await conversionQueueDataService.getAllQueueItems()) || [];
    this.queue = savedQueue.map((item) => ({
      ...item,
      status: item.status === "processing" ? "pending" : item.status,
    }));
  }

  add(item: string) {
    this.queue.push({
      inputPath: item,
      status: "pending",
      paused: false,
      outputPath: getMp4Path(item),
    });
    conversionQueueDataService.putQueueItem(item, {
      inputPath: item,
      status: "pending",
      paused: false,
      outputPath: getMp4Path(item),
    });
    this.processQueue();
  }

  pauseItem(inputPath: string) {
    const itemIndex = this.queue.findIndex((i) => i.inputPath === inputPath);
    const item = this.queue[itemIndex];
    if (item && item.status === "pending") {
      this.queue[itemIndex] = {
        ...item,
        status: "paused",
        paused: true,
      };
      conversionQueueDataService.putQueueItem(
        item.inputPath,
        this.queue[itemIndex],
      );
      return true;
    }
    return false;
  }

  unpauseItem(inputPath: string) {
    const itemIndex = this.queue.findIndex((i) => i.inputPath === inputPath);
    const item = this.queue[itemIndex];
    if (item && item.status === "paused") {
      this.queue[itemIndex] = {
        ...item,
        status: "pending",
        paused: false,
      };
      conversionQueueDataService.putQueueItem(
        item.inputPath,
        this.queue[itemIndex],
      );
      this.processQueue();
      return true;
    }
    return false;
  }

  removeItem(inputPath: string): boolean {
    const itemIndex = this.queue.findIndex((i) => i.inputPath === inputPath);

    if (itemIndex === -1) return false;

    if (this.currentProcessingItem?.inputPath === inputPath) {
      this.cancelCurrentProcessing();
    }

    this.queue.splice(itemIndex, 1);
    conversionQueueDataService.deleteQueueItem(inputPath);
    return true;
  }

  private cancelCurrentProcessing() {
    if (this.currentFFmpegProcess) {
      this.currentFFmpegProcess.kill("SIGTERM");
      this.currentFFmpegProcess = null;
    }
    if (this.currentProcessingItem) {
      this.currentProcessingItem.status = "failed";
      conversionQueueDataService.deleteQueueItem(
        this.currentProcessingItem.inputPath,
      );
      deleteFile(this.currentProcessingItem.outputPath);
      this.currentProcessingItem = null;
    }
    this.isProcessing = false;
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    const nextItem = this.queue.find(
      (item) => item.status === "pending" && !item.paused,
    );

    if (nextItem) {
      this.currentProcessingItem = nextItem;
      nextItem.status = "processing";
      conversionQueueDataService.putQueueItem(nextItem.inputPath, nextItem);
      try {
        await this.processor(nextItem, this, this.progressIntervalMs);
        // Remove item from queue when completed
        const idx = this.queue.findIndex(
          (i) => i.inputPath === nextItem.inputPath,
        );
        if (idx !== -1) {
          this.queue.splice(idx, 1);
          conversionQueueDataService.deleteQueueItem(nextItem.inputPath);
        }
      } catch (error) {
        nextItem.status = "failed";
        conversionQueueDataService.putQueueItem(nextItem.inputPath, nextItem);
        console.error(`Conversion failed for ${nextItem.inputPath}:`, error);
      } finally {
        this.currentProcessingItem = null;
        this.currentFFmpegProcess = null;
      }
    }

    this.isProcessing = false;

    if (this.queue.some((item) => item.status === "pending" && !item.paused)) {
      setTimeout(() => this.processQueue(), CHECK_QUEUE_INTERVAL_MS);
    }
  }

  setCurrentFFmpegProcess(process: ffmpeg.FfmpegCommand) {
    this.currentFFmpegProcess = process;
  }

  getQueue() {
    return [...this.queue];
  }

  isItemPaused(inputPath: string): boolean {
    const item = this.queue.find((i) => i.inputPath === inputPath);
    return item?.status === "paused" || false;
  }

  getCurrentProcessingItem(): ConversionQueueItem | null {
    return this.currentProcessingItem;
  }
}

let conversionQueueInstance: ConversionQueue | null = null;

function getConversionQueueInstance(): ConversionQueue {
  if (!conversionQueueInstance) {
    conversionQueueInstance = new ConversionQueue(processConversion);
  }
  return conversionQueueInstance;
}

export async function addToConversionQueue(inputPath: string) {
  if (await isConvertibleVideoFile(inputPath)) {
    getConversionQueueInstance().add(inputPath);
    return {
      success: true,
      queue: getConversionQueueInstance().getQueue(),
    };
  }
  return {
    success: false,
    queue: getConversionQueueInstance().getQueue(),
  };
}

export function pauseConversionItem(inputPath: string): boolean {
  return getConversionQueueInstance().pauseItem(inputPath);
}

export function unpauseConversionItem(inputPath: string): boolean {
  return getConversionQueueInstance().unpauseItem(inputPath);
}

export function removeFromConversionQueue(inputPath: string): boolean {
  return getConversionQueueInstance().removeItem(inputPath);
}

export function isItemPaused(inputPath: string): boolean {
  return getConversionQueueInstance().isItemPaused(inputPath);
}

export function getCurrentProcessingItem(): ConversionQueueItem | null {
  return getConversionQueueInstance().getCurrentProcessingItem();
}

export async function getConversionQueue(): Promise<ConversionQueueItem[]> {
  return await conversionQueueDataService.getAllQueueItems();
}

export function initializeConversionQueue() {
  getConversionQueueInstance().initializeProcessing();
}

async function processConversion(
  queueItem: ConversionQueueItem,
  queue: ConversionQueue,
  progressIntervalMs: number,
): Promise<void> {
  const mainWindow = getMainWindow();

  if (await isAlreadyConverted(queueItem.outputPath)) {
    // Remove item from queue if already converted
    const idx = queue
      .getQueue()
      .findIndex((i) => i.inputPath === queueItem.inputPath);
    if (idx !== -1) {
      queue.removeItem(queueItem.inputPath);
      this.saveQueue();
    }
    return;
  }

  console.log(
    `Converting "${queueItem.inputPath}" to "${queueItem.outputPath}"`,
  );

  await performConversion(queueItem, mainWindow, queue, progressIntervalMs);
}

async function isConvertibleVideoFile(filePath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(filePath);
    const ext = path.extname(filePath).toLowerCase();
    return stats.isFile() && VIDEO_EXTENSIONS.has(ext);
  } catch (error) {
    console.error(`Error checking file ${filePath}:`, error);
    return false;
  }
}

function getMp4Path(inputPath: string): string {
  const ext = path.extname(inputPath);
  return inputPath.slice(0, -ext.length) + ".mp4";
}

async function isAlreadyConverted(mp4Path: string): Promise<boolean> {
  try {
    await fs.access(mp4Path);
    await videoDataHelpers.calculateDuration(mp4Path);
    console.log(
      `Skipping conversion, "${mp4Path}" already exists and is valid`,
    );
    return true;
  } catch (error) {
    console.log(
      `Proceeding with conversion, "${mp4Path}" not found or invalid`,
    );
    return false;
  }
}

function performConversion(
  queueItem: ConversionQueueItem,
  mainWindow: Electron.BrowserWindow | null,
  queue: ConversionQueue,
  progressIntervalMs: number,
): Promise<void> {
  return new Promise((resolve, reject) => {
    let lastProgressTime = 0;

    const ffmpegCommand = ffmpeg(queueItem.inputPath)
      .output(queueItem.outputPath)
      .on("progress", (progress: ConversionProgress) => {
        const now = Date.now();
        if (now - lastProgressTime >= progressIntervalMs) {
          lastProgressTime = now;
          handleProgress(progress, queueItem, mainWindow);
        }
      })
      .on("end", () =>
        handleConversionEnd(
          queueItem.inputPath,
          queueItem.outputPath,
          resolve,
          mainWindow,
        ),
      )
      .on("error", (err: Error) =>
        handleConversionError(queueItem.inputPath, err, reject, queue),
      );

    queue.setCurrentFFmpegProcess(ffmpegCommand);
    ffmpegCommand.run();
  });
}

function handleProgress(
  progress: ConversionProgress,
  queueItem: ConversionQueueItem,
  mainWindow: Electron.BrowserWindow | null,
) {
  if (progress.percent) {
    process.stdout.write(`Progress: ${progress.percent.toFixed(2)}%   \r`);
    mainWindow?.webContents.send("mp4-conversion-progress", {
      file: `${queueItem.inputPath}:::${queueItem.outputPath}`,
      percent: progress.percent,
      item: {
        ...queueItem,
        percent: progress.percent,
      },
    });
  }
}

async function handleConversionEnd(
  inputPath: string,
  mp4Path: string,
  resolve: (value: void) => void,
  mainWindow: Electron.BrowserWindow | null,
) {
  console.log(`\nFinished: "${mp4Path}"`);
  try {
    const previousData = await videoDbDataService.getVideo(
      normalizeFilePath(inputPath),
    );
    await videoDbDataService.putVideo(mp4Path, previousData);
    await deleteFile(inputPath);
    mainWindow?.webContents.send("mp4-conversion-completed", {
      file: `${inputPath}:::${mp4Path}`,
      percent: 100,
    });
    resolve();
  } catch (error) {
    console.error(`Error handling metadata for "${mp4Path}":`, error);
    resolve();
  }
}

function handleConversionError(
  inputPath: string,
  error: Error,
  reject: (reason?: unknown) => void,
  queue: ConversionQueue,
) {
  console.error(`Error converting "${inputPath}"`, error);
  const item = queue.getQueue().find((i) => i.inputPath === inputPath);
  if (item) {
    item.status = "failed";
    conversionQueueDataService.putQueueItem(item.inputPath, item);
  }
  reject(error);
}
