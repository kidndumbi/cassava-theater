import * as fs from "fs/promises";
import * as path from "path";
import ffmpeg from "fluent-ffmpeg";
import { getMainWindow } from "../mainWindowManager";
import * as videoDataHelpers from "./video.helpers";
import { deleteFile } from "./file.service";

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

interface ConversionQueueItem {
  inputPath: string;
  status: "pending" | "processing" | "completed" | "failed";
}

class ConversionQueue {
  private queue: ConversionQueueItem[] = [];
  private isProcessing = false;

  constructor(private processor: (inputPath: string) => Promise<void>) {}

  add(item: string) {
    this.queue.push({
      inputPath: item,
      status: "pending",
    });
    this.processQueue();
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    const nextItem = this.queue.find((item) => item.status === "pending");

    if (nextItem) {
      nextItem.status = "processing";
      try {
        await this.processor(nextItem.inputPath);
        nextItem.status = "completed";
      } catch (error) {
        nextItem.status = "failed";
        console.error(`Conversion failed for ${nextItem.inputPath}:`, error);
      }
    }

    this.isProcessing = false;

    // Process next item if available
    if (this.queue.some((item) => item.status === "pending")) {
      setTimeout(() => this.processQueue(), CHECK_QUEUE_INTERVAL_MS);
    }
  }

  getQueue() {
    return [...this.queue];
  }
}

// Global queue instance
const conversionQueue = new ConversionQueue(processConversion);

// Main export to add files to queue
export async function addToConversionQueue(inputPath: string) {
  if (await isConvertibleVideoFile(inputPath)) {
    conversionQueue.add(inputPath);
    return true;
  }
  return false;
}

// Core conversion processor
async function processConversion(inputPath: string): Promise<void> {
  const mainWindow = getMainWindow();
  const mp4Path = getMp4Path(inputPath);

  if (await isAlreadyConverted(mp4Path)) {
    return;
  }

  console.log(`Converting "${inputPath}" to "${mp4Path}"`);

  await performConversion(inputPath, mp4Path, mainWindow);
}

// Helper functions (same as before but now private)
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
): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .output(mp4Path)
      .on("progress", (progress: ConversionProgress) =>
        handleProgress(progress, inputPath, mp4Path, mainWindow),
      )
      .on("end", () => handleConversionEnd(inputPath, mp4Path, resolve))
      .on("error", (err: Error) =>
        handleConversionError(inputPath, err, reject),
      )
      .run();
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
) {
  console.log(`\nFinished: "${mp4Path}"`);
  try {
    const previousData = await videoDataHelpers.readJsonData(inputPath);
    await videoDataHelpers.writeJsonToFile(mp4Path, previousData);
    await deleteFile(inputPath);
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
) {
  console.error(`Error converting "${inputPath}"`, error);
  reject(error);
}
