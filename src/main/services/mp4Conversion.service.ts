import * as fs from "fs/promises";
import * as path from "path";
import ffmpeg from "fluent-ffmpeg";
import { getMainWindow } from "../mainWindowManager";
import * as videoDataHelpers from "./video.helpers";
import { deleteFile } from "./file.service";
import { getValue, setValue } from "../store";
import { levelDBService } from "./levelDB.service";
import { normalizeFilePath } from "./helpers";

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

export interface ConversionQueueItem {
  inputPath: string;
  status: "pending" | "processing" | "completed" | "failed" | "paused";
  paused?: boolean;
}

class ConversionQueue {
  private queue: ConversionQueueItem[] = [];
  private isProcessing = false;
  private currentProcessingItem: ConversionQueueItem | null = null;
  private currentFFmpegProcess: ffmpeg.FfmpegCommand | null = null;

  constructor(
    private processor: (
      inputPath: string,
      queue: ConversionQueue,
    ) => Promise<void>,
  ) {}

  initializeProcessing() {
    this.loadQueue();
    this.processQueue();
  }

  private loadQueue() {
    const savedQueue = getValue("conversionQueue") || [];
    this.queue = savedQueue.map((item) => ({
      ...item,
      status: item.status === "processing" ? "pending" : item.status,
    }));
  }

  private saveQueue() {
    setValue("conversionQueue", this.queue);
  }

  add(item: string) {
    this.queue.push({
      inputPath: item,
      status: "pending",
      paused: false,
    });
    this.saveQueue();
    this.processQueue();
  }

  pauseItem(inputPath: string) {
    const item = this.queue.find((i) => i.inputPath === inputPath);
    if (item && item.status === "pending") {
      item.status = "paused";
      this.saveQueue();
      return true;
    }
    return false;
  }

  unpauseItem(inputPath: string) {
    const item = this.queue.find((i) => i.inputPath === inputPath);
    if (item && item.status === "paused") {
      item.status = "pending";
      this.saveQueue();
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
    this.saveQueue();
    return true;
  }

  private cancelCurrentProcessing() {
    if (this.currentFFmpegProcess) {
      this.currentFFmpegProcess.kill("SIGTERM");
      this.currentFFmpegProcess = null;
    }
    if (this.currentProcessingItem) {
      this.currentProcessingItem.status = "failed";
      this.saveQueue();
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
      this.saveQueue();
      try {
        await this.processor(nextItem.inputPath, this);
        // Remove item from queue when completed
        const idx = this.queue.findIndex(
          (i) => i.inputPath === nextItem.inputPath,
        );
        if (idx !== -1) {
          this.queue.splice(idx, 1);
          this.saveQueue();
        }
      } catch (error) {
        nextItem.status = "failed";
        this.saveQueue();
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
    return true;
  }
  return false;
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

export function getConversionQueue(): ConversionQueueItem[] {
  return getConversionQueueInstance().getQueue();
}

export function initializeConversionQueue() {
  getConversionQueueInstance().initializeProcessing();
}

async function processConversion(
  inputPath: string,
  queue: ConversionQueue,
): Promise<void> {
  const mainWindow = getMainWindow();
  const mp4Path = getMp4Path(inputPath);

  if (await isAlreadyConverted(mp4Path)) {
    // Remove item from queue if already converted
    const idx = queue.getQueue().findIndex((i) => i.inputPath === inputPath);
    if (idx !== -1) {
      queue.removeItem(inputPath);
      this.saveQueue();
    }
    return;
  }

  console.log(`Converting "${inputPath}" to "${mp4Path}"`);

  await performConversion(inputPath, mp4Path, mainWindow, queue);
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
  inputPath: string,
  mp4Path: string,
  mainWindow: Electron.BrowserWindow | null,
  queue: ConversionQueue,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const ffmpegCommand = ffmpeg(inputPath)
      .output(mp4Path)
      .on("progress", (progress: ConversionProgress) =>
        handleProgress(progress, inputPath, mp4Path, mainWindow),
      )
      .on("end", () =>
        handleConversionEnd(inputPath, mp4Path, resolve, mainWindow, queue),
      )
      .on("error", (err: Error) =>
        handleConversionError(inputPath, err, reject, queue),
      );

    queue.setCurrentFFmpegProcess(ffmpegCommand);
    ffmpegCommand.run();
  });
}

function handleProgress(
  progress: ConversionProgress,
  inputPath: string,
  mp4Path: string,
  mainWindow: Electron.BrowserWindow | null,
) {
  if (progress.percent) {
    process.stdout.write(`Progress: ${progress.percent.toFixed(2)}%   \r`);
    mainWindow?.webContents.send("mp4-conversion-progress", {
      file: `${inputPath}:::${mp4Path}`,
      percent: progress.percent,
    });
  }
}

async function handleConversionEnd(
  inputPath: string,
  mp4Path: string,
  resolve: (value: void) => void,
  mainWindow: Electron.BrowserWindow | null,
  queue: ConversionQueue,
) {
  console.log(`\nFinished: "${mp4Path}"`);
  try {
    const previousData = await levelDBService.getVideo(
      normalizeFilePath(inputPath),
    );
    await levelDBService.putVideo(mp4Path, previousData);
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
    setValue("conversionQueue", queue.getQueue());
  }
  reject(error);
}
