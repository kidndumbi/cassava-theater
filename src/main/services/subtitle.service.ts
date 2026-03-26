import { AppSocketEvents } from "../../enums/app-socket-events.enum";
import { spawn, ChildProcess } from "child_process";
import * as fs from "fs/promises";
import * as path from "path";
import { getMainWindow } from "../mainWindowManager";
import { loggingService as log } from "./main-logging.service";
import { normalizeFilePath } from "./helpers";
import { SubtitleGenerationQueueItem } from "../../models/subtitle-generation-queue-item.model";
import * as subtitleQueueDataService from "./subtitleQueueDataDb.service";
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
  ".mp4",
]);
const CHECK_QUEUE_INTERVAL_MS = 1000;

interface SubtitleProgress {
  percent?: number;
}

class SubtitleGenerationQueue {
  private queue: SubtitleGenerationQueueItem[] = [];
  private isProcessing = false;
  private currentProcessingItem: SubtitleGenerationQueueItem | null = null;
  private currentWhisperProcess: ChildProcess | null = null;
  private progressIntervalMs = 2000;
  private socketIo = getSocketIoGlobal();

  constructor(
    private processor: (
      queueItem: SubtitleGenerationQueueItem,
      queue: SubtitleGenerationQueue,
      progressIntervalMs: number,
    ) => Promise<void>,
  ) {}

  async initializeProcessing() {
    await this.loadQueue();
    this.processQueue();
  }

  private async loadQueue() {
    const savedQueue =
      (await subtitleQueueDataService.getAllSubtitleQueueItems()) || [];
    this.queue = savedQueue.map((item) => ({
      ...item,
      status: item.status === "processing" ? "pending" : item.status,
    }));
  }

  async add(
    filePath: string, 
    language?: string, 
    format?: string, 
    model?: string
  ) {
    const id = uuidv4();
    const normalizedPath = normalizeFilePath(filePath);
    const fileName = path.basename(normalizedPath);

    console.log("🎬 SubtitleQueue: Adding item to queue", { filePath: normalizedPath, language, format, model });

    // Validate format parameter
    const validFormats = ["vtt", "srt", "ass"] as const;
    const validatedFormat = format && validFormats.includes(format as any) 
      ? (format as "vtt" | "srt" | "ass") 
      : "vtt";

    const newData: SubtitleGenerationQueueItem = {
      id,
      videoPath: normalizedPath,
      fileName,
      status: "pending",
      percent: 0,
      language: language || "en",
      format: validatedFormat,
      model: model || "base",
    };

    console.log("🎬 SubtitleQueue: Creating queue item:", newData);
    const dbData = await subtitleQueueDataService.putSubtitleQueueItem(id, newData);
    console.log("🎬 SubtitleQueue: Item saved to DB:", dbData);
    
    this.queue.push(dbData);
    console.log("🎬 SubtitleQueue: Current queue length:", this.queue.length);
    
    // Emit queue update to frontend
    const mainWindow = getMainWindow();
    if (mainWindow && !mainWindow.isDestroyed()) {
      console.log("🎬 SubtitleQueue: Sending queue update to frontend");
      mainWindow.webContents.send("subtitle-generation-update-from-backend", {
        queue: this.queue,
      });
    }
    
    this.socketIo.emit(AppSocketEvents.SUBTITLE_GENERATION_QUEUE_UPDATED, {
      queue: this.queue,
    });
    
    this.processQueue();
  }

  pauseItem(id: string) {
    const itemIndex = this.queue.findIndex((i) => i.id === id);
    const item = this.queue[itemIndex];
    if (item && item.status === "pending") {
      this.queue[itemIndex] = {
        ...item,
        status: "paused",
      };
      subtitleQueueDataService.putSubtitleQueueItem(item.id, this.queue[itemIndex]);
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
      };
      subtitleQueueDataService.putSubtitleQueueItem(item.id, this.queue[itemIndex]);
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
    queue: SubtitleGenerationQueueItem[];
  } {
    const itemIndex = this.queue.findIndex((i) => i.id === id);

    if (itemIndex === -1) return { success: false, queue: this.queue };

    if (this.currentProcessingItem?.id === id) {
      this.cancelCurrentProcessing();
    }

    this.queue.splice(itemIndex, 1);
    subtitleQueueDataService.deleteSubtitleQueueItem(id);
    this.socketIo.emit(AppSocketEvents.SUBTITLE_GENERATION_ITEM_CANCELLED, {
      queue: this.queue,
    });
    return {
      success: true,
      queue: this.queue,
    };
  }

  private cancelCurrentProcessing() {
    if (this.currentWhisperProcess) {
      this.currentWhisperProcess.kill("SIGTERM");
      this.currentWhisperProcess = null;
    }
    if (this.currentProcessingItem) {
      this.currentProcessingItem.status = "failed";
      subtitleQueueDataService.deleteSubtitleQueueItem(this.currentProcessingItem.id);
      this.currentProcessingItem = null;
    }
    this.isProcessing = false;
  }

  private async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    const nextItem = this.queue.find(
      (item) => item.status === "pending",
    );

    if (nextItem) {
      this.currentProcessingItem = nextItem;
      nextItem.status = "processing";
      subtitleQueueDataService.putSubtitleQueueItem(nextItem.id, nextItem);
      try {
        await this.processor(nextItem, this, this.progressIntervalMs);
        // Remove item from queue when completed
        const idx = this.queue.findIndex((i) => i.id === nextItem.id);
        if (idx !== -1) {
          this.queue.splice(idx, 1);
          subtitleQueueDataService.deleteSubtitleQueueItem(nextItem.id);
        }
      } catch (error) {
        nextItem.status = "failed";
        nextItem.error = error instanceof Error ? error.message : "Unknown error";
        subtitleQueueDataService.putSubtitleQueueItem(nextItem.id, nextItem);
        log.error(`Subtitle generation failed for ${nextItem.videoPath}:`, error);
      } finally {
        this.currentProcessingItem = null;
        this.currentWhisperProcess = null;
      }
    }

    this.isProcessing = false;

    if (this.queue.some((item) => item.status === "pending")) {
      setTimeout(() => this.processQueue(), CHECK_QUEUE_INTERVAL_MS);
    }
  }

  setCurrentWhisperProcess(process: ChildProcess) {
    this.currentWhisperProcess = process;
  }

  getQueue() {
    return [...this.queue];
  }

  isItemPaused(id: string): boolean {
    const item = this.queue.find((i) => i.id === id);
    return item?.status === "paused" || false;
  }

  getCurrentProcessingItem(): SubtitleGenerationQueueItem | null {
    return this.currentProcessingItem;
  }

  async swapQueueItems(
    id1: string,
    id2: string,
  ): Promise<{ success: boolean; queue: SubtitleGenerationQueueItem[] }> {
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

    // Update queueIndex in DB and in memory
    this.queue[index1].queueIndex = index1;
    this.queue[index2].queueIndex = index2;
    await subtitleQueueDataService.putSubtitleQueueItem(
      this.queue[index1].id,
      this.queue[index1],
    );
    await subtitleQueueDataService.putSubtitleQueueItem(
      this.queue[index2].id,
      this.queue[index2],
    );

    return { success: true, queue: this.queue };
  }
}

let subtitleGenerationQueueInstance: SubtitleGenerationQueue | null = null;

function getSubtitleGenerationQueueInstance(): SubtitleGenerationQueue {
  if (!subtitleGenerationQueueInstance) {
    subtitleGenerationQueueInstance = new SubtitleGenerationQueue(processSubtitleGeneration);
  }
  return subtitleGenerationQueueInstance;
}

export async function addToSubtitleGenerationQueue(
  inputPath: string,
  language?: string,
  format?: string,
  model?: string
) {
  if (await isVideoFile(inputPath)) {
    await getSubtitleGenerationQueueInstance().add(inputPath, language, format, model);
    return {
      success: true,
      queue: getSubtitleGenerationQueueInstance().getQueue(),
    };
  }
  return {
    success: false,
    queue: getSubtitleGenerationQueueInstance().getQueue(),
  };
}

export async function addToSubtitleGenerationQueueBulk(
  inputPaths: string[],
  language?: string,
  format?: string,
  model?: string
): Promise<{
  success: boolean;
  queue: SubtitleGenerationQueueItem[];
}> {
  const validPaths = await Promise.all(
    inputPaths.map(async (inputPath) => ({
      inputPath,
      isValid: await isVideoFile(inputPath),
    })),
  );

  const validInputPaths = validPaths
    .filter((item) => item.isValid)
    .map((item) => item.inputPath);

  if (validInputPaths.length > 0) {
    const instance = getSubtitleGenerationQueueInstance();
    for (const path of validInputPaths) {
      await instance.add(path, language, format, model);
    }
  }

  return {
    success: validInputPaths.length > 0,
    queue: getSubtitleGenerationQueueInstance().getQueue(),
  };
}

export function getSubtitleGenerationQueue(): SubtitleGenerationQueueItem[] {
  return getSubtitleGenerationQueueInstance().getQueue();
}

export function removeFromSubtitleGenerationQueue(id: string): {
  success: boolean;
  queue: SubtitleGenerationQueueItem[];
} {
  return getSubtitleGenerationQueueInstance().removeItem(id);
}

export function pauseSubtitleGenerationQueueItem(id: string) {
  return getSubtitleGenerationQueueInstance().pauseItem(id);
}

export function unpauseSubtitleGenerationQueueItem(id: string) {
  return getSubtitleGenerationQueueInstance().unpauseItem(id);
}

export async function swapSubtitleGenerationQueueItems(
  id1: string,
  id2: string,
): Promise<{ success: boolean; queue: SubtitleGenerationQueueItem[] }> {
  return await getSubtitleGenerationQueueInstance().swapQueueItems(id1, id2);
}

export async function initializeSubtitleGenerationService() {
  const instance = getSubtitleGenerationQueueInstance();
  await instance.initializeProcessing();
}

async function processSubtitleGeneration(
  queueItem: SubtitleGenerationQueueItem,
  queue: SubtitleGenerationQueue,
  progressIntervalMs: number,
): Promise<void> {
  const mainWindow = getMainWindow();
  const socketIo = getSocketIoGlobal();

  if (await subtitleAlreadyExists(queueItem.videoPath, queueItem.format)) {
    // Remove item from queue if subtitle already exists
    const idx = queue.getQueue().findIndex((i) => i.id === queueItem.id);
    if (idx !== -1) {
      queue.removeItem(queueItem.id);
    }
    return;
  }

  await performSubtitleGeneration(
    queueItem,
    mainWindow,
    queue,
    progressIntervalMs,
    socketIo,
  );
}

async function isVideoFile(filePath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(filePath);
    const ext = path.extname(filePath).toLowerCase();
    return stats.isFile() && VIDEO_EXTENSIONS.has(ext);
  } catch (error) {
    log.error(`Error checking file ${filePath}:`, error);
    return false;
  }
}

function getSubtitlePath(videoPath: string, format: string): string {
  const videoBaseName = path.parse(videoPath).name;
  const videoDir = path.dirname(videoPath);
  return path.join(videoDir, `${videoBaseName}.${format}`);
}

async function subtitleAlreadyExists(videoPath: string, format: string): Promise<boolean> {
  try {
    const subtitlePath = getSubtitlePath(videoPath, format);
    await fs.access(subtitlePath);
    log.info(`Skipping subtitle generation, "${subtitlePath}" already exists`);
    return true;
  } catch (error) {
    log.info(`Proceeding with subtitle generation, subtitle not found`);
    return false;
  }
}

function performSubtitleGeneration(
  queueItem: SubtitleGenerationQueueItem,
  mainWindow: Electron.BrowserWindow | null,
  queue: SubtitleGenerationQueue,
  progressIntervalMs: number,
  socketIo: Server,
): Promise<void> {
  return new Promise((resolve, reject) => {
    let lastProgressTime = 0;
    const subtitlePath = getSubtitlePath(queueItem.videoPath, queueItem.format);
    const videoDir = path.dirname(queueItem.videoPath);

    const args = [
      queueItem.videoPath,
      '--output_format', queueItem.format,
      '--output_dir', videoDir,
      '--model', queueItem.model
    ];

    // Add language if specified and not 'auto'
    if (queueItem.language && queueItem.language !== 'auto') {
      args.push('--language', queueItem.language);
    }

    log.info(`🎬 Starting subtitle generation for: ${path.basename(queueItem.videoPath)}`);
    log.info(`📂 Video directory: ${videoDir}`);
    log.info(`🎯 Target subtitle file: ${subtitlePath}`);

    const whisperProcess = spawn('whisper', args, {
      stdio: ['ignore', 'pipe', 'pipe']
    });

    queue.setCurrentWhisperProcess(whisperProcess);

    log.info(`🚀 Whisper process started with PID: ${whisperProcess.pid}`);
    
    // Set up a heartbeat to show the process is still running
    const heartbeatInterval = setInterval(() => {
      log.info(`⏳ Subtitle generation in progress... (PID: ${whisperProcess.pid})`);
    }, 10000); // Log every 10 seconds

    let stdout = '';
    let stderr = '';

    whisperProcess.stdout?.on('data', (data) => {
      stdout += data.toString();
      const output = data.toString().trim();
      if (output) {
        log.info(`📝 Whisper stdout: ${output}`);
      }
      
      // Try to parse progress from whisper output if possible
      const progressMatch = stdout.match(/(\d+)%/);
      if (progressMatch) {
        const now = Date.now();
        if (now - lastProgressTime >= progressIntervalMs) {
          lastProgressTime = now;
          handleProgress(
            { percent: parseInt(progressMatch[1]) },
            queueItem,
            mainWindow,
            socketIo,
          );
        }
      }
    });

    whisperProcess.stderr?.on('data', (data) => {
      stderr += data.toString();
      const errorOutput = data.toString().trim();
      if (errorOutput) {
        // Don't log FP16 warning as error - it's normal
        if (errorOutput.includes('FP16 is not supported on CPU')) {
          log.info(`ℹ️  Whisper info: Using FP32 instead of FP16 (normal for CPU)`);
        } else if (errorOutput.includes('Detecting language')) {
          log.info(`🔍 Whisper: ${errorOutput}`);
        } else if (errorOutput.includes('loading model')) {
          log.info(`📂 Whisper: ${errorOutput}`);
        } else {
          log.info(`🔧 Whisper: ${errorOutput}`);
        }
      }
    });

    whisperProcess.on('close', async (code) => {
      clearInterval(heartbeatInterval);
      log.info(`🏁 Whisper process completed with exit code: ${code}`);

      if (code === 0) {
        try {
          // Verify the subtitle file was created
          await fs.access(subtitlePath);
          log.info(`✅ Subtitle generation completed successfully!`);
          log.info(`📁 Subtitle file created: ${subtitlePath}`);
          handleSubtitleGenerationEnd(resolve, mainWindow, queueItem, socketIo);
        } catch (error) {
          log.error(`❌ Subtitle file not found after generation: ${subtitlePath}`);
          handleSubtitleGenerationError(
            queueItem.videoPath, 
            new Error('Subtitle file not created'), 
            reject, 
            queueItem
          );
        }
      } else {
        const errorMessage = `Whisper process failed with exit code ${code}`;
        if (stderr.trim()) {
          log.error(`${errorMessage}. Error output: ${stderr.trim()}`);
        } else {
          log.error(errorMessage);
        }
        handleSubtitleGenerationError(
          queueItem.videoPath,
          new Error(errorMessage),
          reject,
          queueItem
        );
      }
    });

    whisperProcess.on('error', (error) => {
      clearInterval(heartbeatInterval);
      log.error(`❌ Failed to start Whisper process:`, error);
      handleSubtitleGenerationError(queueItem.videoPath, error, reject, queueItem);
    });
  });
}

function handleProgress(
  progress: SubtitleProgress,
  queueItem: SubtitleGenerationQueueItem,
  mainWindow: Electron.BrowserWindow | null,
  socketIo: Server,
) {
  queueItem.percent = progress.percent || 0;

  const progressInfo = {
    id: queueItem.id,
    percent: queueItem.percent,
    queue: getSubtitleGenerationQueueInstance().getQueue(),
  };

  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("subtitle-generation-progress", progressInfo);
  }

  socketIo.emit(AppSocketEvents.SUBTITLE_GENERATION_PROGRESS, progressInfo);
}

function handleSubtitleGenerationEnd(
  resolve: () => void,
  mainWindow: Electron.BrowserWindow | null,
  queueItem: SubtitleGenerationQueueItem,
  socketIo: Server,
) {
  queueItem.percent = 100;
  queueItem.status = "completed";

  const completeInfo = {
    id: queueItem.id,
    queue: getSubtitleGenerationQueueInstance().getQueue(),
  };

  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("subtitle-generation-complete", completeInfo);
  }

  socketIo.emit(AppSocketEvents.SUBTITLE_GENERATION_COMPLETE, completeInfo);
  resolve();
}

function handleSubtitleGenerationError(
  filePath: string,
  error: Error,
  reject: (reason?: any) => void,
  queueItem: SubtitleGenerationQueueItem,
) {
  log.error(`Subtitle generation failed for "${filePath}": ${error.message}`);
  queueItem.status = "failed";
  queueItem.error = error.message;
  reject(error);
}

export const getExistingSubtitles = async (videoPath: string): Promise<string[]> => {
  const normalizedVideoPath = normalizeFilePath(videoPath);
  const videoDir = path.dirname(normalizedVideoPath);
  const videoBaseName = path.parse(normalizedVideoPath).name;
  
  const subtitleExtensions = ['srt', 'vtt', 'ass'];
  const existingSubtitles: string[] = [];
  
  for (const ext of subtitleExtensions) {
    const subtitlePath = path.join(videoDir, `${videoBaseName}.${ext}`);
    try {
      await fs.access(subtitlePath);
      existingSubtitles.push(subtitlePath);
    } catch {
      // Subtitle file doesn't exist, continue
    }
  }
  
  return existingSubtitles;
};