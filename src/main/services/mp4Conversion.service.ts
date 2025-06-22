import { AppSocketEvents } from "./../../enums/app-socket-events.enum";
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
import { getSocketIoGlobal } from "../socketGlobalManager";
import { v4 as uuidv4 } from "uuid";
import { Server } from "socket.io";

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
  private socketIo = getSocketIoGlobal();

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

  async add(filePath: string) {
    const id = uuidv4();

    const newData: ConversionQueueItem = {
      id,
      inputPath: filePath,
      status: "pending",
      paused: false,
      outputPath: getMp4Path(filePath),
    };

    const dbData = await conversionQueueDataService.putQueueItem(id, newData);
    this.queue.push(dbData);
    this.processQueue();
  }

  pauseItem(id: string) {
    const itemIndex = this.queue.findIndex((i) => i.id === id);
    const item = this.queue[itemIndex];
    if (item && item.status === "pending") {
      this.queue[itemIndex] = {
        ...item,
        status: "paused",
        paused: true,
      };
      conversionQueueDataService.putQueueItem(item.id, this.queue[itemIndex]);
      return {
        success: true,
        queue: this.queue,
      };
    }
    return {
      success: false,
      queue: this.queue,
    };
  }

  unpauseItem(id: string) {
    const itemIndex = this.queue.findIndex((i) => i.id === id);
    const item = this.queue[itemIndex];
    if (item && item.status === "paused") {
      this.queue[itemIndex] = {
        ...item,
        status: "pending",
        paused: false,
      };
      conversionQueueDataService.putQueueItem(item.id, this.queue[itemIndex]);
      this.processQueue();
      return {
        success: true,
        queue: this.queue,
      };
    }
    return {
      success: false,
      queue: this.queue,
    };
  }

  removeItem(id: string): {
    success: boolean;
    queue: ConversionQueueItem[];
  } {
    const itemIndex = this.queue.findIndex((i) => i.id === id);

    if (itemIndex === -1) return { success: false, queue: this.queue };

    if (this.currentProcessingItem?.id === id) {
      this.cancelCurrentProcessing();
    }

    this.queue.splice(itemIndex, 1);
    conversionQueueDataService.deleteQueueItem(id);
    this.socketIo.emit(AppSocketEvents.MP4_CONVERION_ITEM_CANCELLED, {
      queue: this.queue,
    });
    return {
      success: true,
      queue: this.queue,
    };
  }

  private cancelCurrentProcessing() {
    if (this.currentFFmpegProcess) {
      this.currentFFmpegProcess.kill("SIGTERM");
      this.currentFFmpegProcess = null;
    }
    if (this.currentProcessingItem) {
      this.currentProcessingItem.status = "failed";
      conversionQueueDataService.deleteQueueItem(this.currentProcessingItem.id);
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
      conversionQueueDataService.putQueueItem(nextItem.id, nextItem);
      try {
        await this.processor(nextItem, this, this.progressIntervalMs);
        // Remove item from queue when completed
        const idx = this.queue.findIndex((i) => i.id === nextItem.id);
        if (idx !== -1) {
          this.queue.splice(idx, 1);
          conversionQueueDataService.deleteQueueItem(nextItem.id);
        }
      } catch (error) {
        nextItem.status = "failed";
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

  isItemPaused(id: string): boolean {
    const item = this.queue.find((i) => i.id === id);
    return item?.status === "paused" || false;
  }

  getCurrentProcessingItem(): ConversionQueueItem | null {
    return this.currentProcessingItem;
  }

  async swapQueueItems(
    id1: string,
    id2: string,
  ): Promise<{ success: boolean; queue: ConversionQueueItem[] }> {
    const index1 = this.queue.findIndex((item) => item.id === id1);
    const index2 = this.queue.findIndex((item) => item.id === id2);

    if (index1 === -1 || index2 === -1) {
      return { success: false, queue: this.queue };
    }
    if (
      this.queue[index1].status !== "pending" ||
      this.queue[index2].status !== "pending"
    ) {
      return { success: false, queue: this.queue };
    }

    // Swap in memory
    [this.queue[index1], this.queue[index2]] = [
      this.queue[index2],
      this.queue[index1],
    ];

    // Update queueIndex in DB and in memory if such property exists
    // Assign new queueIndex based on their new positions
    if (
      "queueIndex" in this.queue[index1] &&
      "queueIndex" in this.queue[index2]
    ) {
      this.queue[index1].queueIndex = index1;
      this.queue[index2].queueIndex = index2;
      await conversionQueueDataService.putQueueItem(
        this.queue[index1].id,
        this.queue[index1],
      );
      await conversionQueueDataService.putQueueItem(
        this.queue[index2].id,
        this.queue[index2],
      );
    }

    return { success: true, queue: this.queue };
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
    await getConversionQueueInstance().add(inputPath);
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

export async function addToConversionQueueBulk(inputPaths: string[]): Promise<{
  success: boolean;
  queue: ConversionQueueItem[];
}> {
  const validPaths = await Promise.all(
    inputPaths.map(async (inputPath) => ({
      inputPath,
      isValid: await isConvertibleVideoFile(inputPath),
    })),
  );

  const validInputPaths = validPaths
    .filter((item) => item.isValid)
    .map((item) => item.inputPath);

  if (validInputPaths.length > 0) {
    for (const inputPath of validInputPaths) {
      await getConversionQueueInstance().add(inputPath);
    }
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

export function pauseConversionItem(id: string): {
  success: boolean;
  queue: ConversionQueueItem[];
} {
  return getConversionQueueInstance().pauseItem(id);
}

export function unpauseConversionItem(id: string): {
  success: boolean;
  queue: ConversionQueueItem[];
} {
  return getConversionQueueInstance().unpauseItem(id);
}

export function removeFromConversionQueue(id: string): {
  success: boolean;
  queue: ConversionQueueItem[];
} {
  return getConversionQueueInstance().removeItem(id);
}

export function isItemPaused(id: string): boolean {
  return getConversionQueueInstance().isItemPaused(id);
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

export async function swapConversionQueueItems(
  id1: string,
  id2: string,
): Promise<{ success: boolean; queue: ConversionQueueItem[] }> {
  return await getConversionQueueInstance().swapQueueItems(id1, id2);
}

async function processConversion(
  queueItem: ConversionQueueItem,
  queue: ConversionQueue,
  progressIntervalMs: number,
): Promise<void> {
  const mainWindow = getMainWindow();
  const socketIo = getSocketIoGlobal();

  if (await isAlreadyConverted(queueItem.outputPath)) {
    // Remove item from queue if already converted
    const idx = queue.getQueue().findIndex((i) => i.id === queueItem.id);
    if (idx !== -1) {
      queue.removeItem(queueItem.id);
      this.saveQueue?.();
    }
    return;
  }

  await performConversion(
    queueItem,
    mainWindow,
    queue,
    progressIntervalMs,
    socketIo,
  );
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
  socketIo: Server,
): Promise<void> {
  return new Promise((resolve, reject) => {
    let lastProgressTime = 0;

    const ffmpegCommand = ffmpeg(queueItem.inputPath)
      .output(queueItem.outputPath)
      .on("progress", (progress: ConversionProgress) => {
        const now = Date.now();
        if (now - lastProgressTime >= progressIntervalMs) {
          lastProgressTime = now;
          handleProgress(progress, queueItem, mainWindow, socketIo);
        }
      })
      .on("end", () =>
        handleConversionEnd(resolve, mainWindow, queueItem, socketIo),
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
  socketIo: Server,
) {
  if (progress.percent) {
    process.stdout.write(`Progress: ${progress.percent.toFixed(2)}%   \r`);

    const progressData = {
      queue: getConversionQueueInstance()
        .getQueue()
        .map((item) => {
          if (item.id === queueItem.id) {
            return {
              ...queueItem,
              percent: progress.percent,
            };
          }
          return item;
        })
        .sort(sortConversionQueue),
    };

    mainWindow?.webContents.send("mp4-conversion-progress", progressData);
    socketIo.emit(AppSocketEvents.MP4_CONVERSION_PROGRESS, progressData);
  }
}

const sortConversionQueue = (
  a: ConversionQueueItem,
  b: ConversionQueueItem,
) => {
  if (a.status === "processing" && b.status !== "processing") return -1;
  if (a.status !== "processing" && b.status === "processing") return 1;
  return 0;
};

async function handleConversionEnd(
  resolve: (value: void) => void,
  mainWindow: Electron.BrowserWindow | null,
  queueItem: ConversionQueueItem,
  socketIo: Server,
) {
  console.log(`\nFinished: "${queueItem.outputPath}"`);
  try {
    const previousData = await videoDbDataService.getVideo(
      normalizeFilePath(queueItem.inputPath),
    );
    await videoDbDataService.putVideo(queueItem.outputPath, previousData);
    await deleteFile(queueItem.inputPath);

    const completionData = {
      queueItem,
      queue: getConversionQueueInstance()
        .getQueue()
        .filter((q) => q.id !== queueItem.id)
        .sort(sortConversionQueue),
    };

    mainWindow?.webContents.send("mp4-conversion-completed", completionData);
    socketIo.emit(AppSocketEvents.MP4_CONVERSION_ITEM_COMPLETED, completionData);
    resolve();
  } catch (error) {
    console.error(
      `Error handling metadata for "${queueItem.outputPath}":`,
      error,
    );
    resolve();
  }
}

function handleConversionError(
  id: string,
  error: Error,
  reject: (reason?: unknown) => void,
  queue: ConversionQueue,
) {
  const item = queue.getQueue().find((i) => i.id === id);
  if (item) {
    item.status = "failed";
  }
  console.error(`Error converting "${item?.inputPath ?? id}"`, error);
  reject(error);
}
