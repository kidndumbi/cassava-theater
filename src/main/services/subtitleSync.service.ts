import { AppSocketEvents } from "./../../enums/app-socket-events.enum";
import * as fs from "fs/promises";
import * as path from "path";
import { getMainWindow } from "../mainWindowManager";
import { normalizeFilePath } from "./helpers";
import { SubtitleSyncQueueItem } from "../../models/subtitle-sync-queue-item.model";
import * as subtitleSyncQueueDataService from "./subtitleSyncQueueDataDb.service";
import { getSocketIoGlobal } from "../socketGlobalManager";
import { v4 as uuidv4 } from "uuid";
import { Server } from "socket.io";
import { syncSubtitleWithAlass } from "./file.service";
import { loggingService } from "./main-logging.service";
import * as videoDbDataService from "./videoDbData.service";

const VIDEO_EXTENSIONS = new Set([
  ".mp4",
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

const SUBTITLE_EXTENSIONS = new Set([
  ".vtt",
  ".srt",
  ".ass",
  ".ssa",
]);

const CHECK_QUEUE_INTERVAL_MS = 1000;

class SubtitleSyncQueue {
  private queue: SubtitleSyncQueueItem[] = [];
  private isProcessing = false;
  private currentProcessingItem: SubtitleSyncQueueItem | null = null;
  private progressIntervalMs = 2000;
  private socketIo = getSocketIoGlobal();

  constructor(
    private processor: (
      queueItem: SubtitleSyncQueueItem,
      queue: SubtitleSyncQueue,
      progressIntervalMs: number,
    ) => Promise<void>,
  ) {
    this.socketIo = getSocketIoGlobal();
  }

  async initializeProcessing() {
    await this.loadQueue();
    this.processQueue();
  }

  private async loadQueue() {
    const savedQueue =
      (await subtitleSyncQueueDataService.getAllSubtitleSyncQueueItems()) || [];
    this.queue = savedQueue.map((item) => ({
      ...item,
      status: item.status === "processing" ? "pending" : item.status,
    }));
  }

  async add(
    videoPath: string,
    subtitlePath: string,
    options?: {
      splitPenalty?: number;
      noSplits?: boolean;
    }
  ) {
    const id = uuidv4();
    const normalizedVideoPath = normalizeFilePath(videoPath);
    const normalizedSubtitlePath = normalizeFilePath(subtitlePath);
    const fileName = path.basename(normalizedVideoPath);

    const newData: SubtitleSyncQueueItem = {
      id,
      videoPath: normalizedVideoPath,
      subtitlePath: normalizedSubtitlePath,
      fileName,
      status: "pending",
      paused: false,
      percent: 0,
      splitPenalty: options?.splitPenalty,
      noSplits: options?.noSplits,
    };

    const dbData = await subtitleSyncQueueDataService.putSubtitleSyncQueueItem(id, newData);
    this.queue.push(dbData);
    this.processQueue();
    
    // Notify frontend
    const mainWindow = getMainWindow();
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("subtitle-sync-update-from-backend", {
        queue: this.queue,
      });
    }
    
    if (this.socketIo) {
      this.socketIo.emit(AppSocketEvents.SUBTITLE_SYNC_QUEUE_UPDATED, {
        queue: this.queue,
      });
    }
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
      subtitleSyncQueueDataService.putSubtitleSyncQueueItem(id, this.queue[itemIndex]);
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
      subtitleSyncQueueDataService.putSubtitleSyncQueueItem(id, this.queue[itemIndex]);
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
    queue: SubtitleSyncQueueItem[];
  } {
    const itemIndex = this.queue.findIndex((i) => i.id === id);

    if (itemIndex === -1) return { success: false, queue: this.queue };

    if (this.currentProcessingItem?.id === id) {
      this.cancelCurrentProcessing();
    }

    this.queue.splice(itemIndex, 1);
    subtitleSyncQueueDataService.deleteSubtitleSyncQueueItem(id);
    if (this.socketIo) {
      this.socketIo.emit(AppSocketEvents.SUBTITLE_SYNC_ITEM_CANCELLED, {
        queue: this.queue,
      });
    }
    return {
      success: true,
      queue: this.queue,
    };
  }

  private cancelCurrentProcessing() {
    if (this.currentProcessingItem) {
      const currentItem = this.currentProcessingItem;
      currentItem.status = "failed";
      if (currentItem.id) {
        subtitleSyncQueueDataService.deleteSubtitleSyncQueueItem(currentItem.id);
      }
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

    if (nextItem && nextItem.id) {
      const itemId = nextItem.id; // Store ID to ensure TypeScript knows it's defined
      this.currentProcessingItem = nextItem;
      nextItem.status = "processing";
      subtitleSyncQueueDataService.putSubtitleSyncQueueItem(itemId, nextItem);
      try {
        await this.processor(nextItem, this, this.progressIntervalMs);
        // Remove item from queue when completed
        const idx = this.queue.findIndex((i) => i.id === itemId);
        if (idx !== -1) {
          this.queue.splice(idx, 1);
          subtitleSyncQueueDataService.deleteSubtitleSyncQueueItem(itemId);
          
          // Notify frontend of queue update after removal
          const mainWindow = getMainWindow();
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send("subtitle-sync-update-from-backend", {
              queue: this.queue,
            });
          }
        }
      } catch (error) {
        nextItem.status = "failed";
        nextItem.error = error instanceof Error ? error.message : "Unknown error";
        if (nextItem.id) {
          subtitleSyncQueueDataService.putSubtitleSyncQueueItem(nextItem.id, nextItem);
        }
        loggingService.error(`Subtitle sync failed for ${nextItem.videoPath}:`, error);
        
        // Notify frontend of the failed item status update
        const mainWindow = getMainWindow();
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send("subtitle-sync-update-from-backend", {
            queue: this.queue,
          });
        }
      } finally {
        this.currentProcessingItem = null;
      }
    }

    this.isProcessing = false;

    if (this.queue.some((item) => item.status === "pending" && !item.paused)) {
      setTimeout(() => this.processQueue(), CHECK_QUEUE_INTERVAL_MS);
    }
  }

  getQueue() {
    return [...this.queue];
  }

  isItemPaused(id: string): boolean {
    const item = this.queue.find((i) => i.id === id);
    return item?.status === "paused" || false;
  }

  getCurrentProcessingItem(): SubtitleSyncQueueItem | null {
    return this.currentProcessingItem;
  }

  async swapQueueItems(
    id1: string,
    id2: string,
  ): Promise<{ success: boolean; queue: SubtitleSyncQueueItem[] }> {
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
    if (this.queue[index1].id && this.queue[index2].id) {
      await subtitleSyncQueueDataService.putSubtitleSyncQueueItem(
        this.queue[index1].id,
        this.queue[index1],
      );
      await subtitleSyncQueueDataService.putSubtitleSyncQueueItem(
        this.queue[index2].id,
        this.queue[index2],
      );
    }

    return { success: true, queue: this.queue };
  }
}

let subtitleSyncQueueInstance: SubtitleSyncQueue | null = null;

function getSubtitleSyncQueueInstance(): SubtitleSyncQueue {
  if (!subtitleSyncQueueInstance) {
    subtitleSyncQueueInstance = new SubtitleSyncQueue(processSubtitleSync);
  }
  return subtitleSyncQueueInstance;
}

export async function addToSubtitleSyncQueue(
  videoPath: string,
  subtitlePath: string,
  options?: {
    splitPenalty?: number;
    noSplits?: boolean;
  }
) {
  if (await isValidVideoFile(videoPath) && await isValidSubtitleFile(subtitlePath)) {
    await getSubtitleSyncQueueInstance().add(videoPath, subtitlePath, options);
    return {
      success: true,
      queue: getSubtitleSyncQueueInstance().getQueue(),
    };
  }
  return {
    success: false,
    queue: getSubtitleSyncQueueInstance().getQueue(),
  };
}

export async function addToSubtitleSyncQueueBulk(
  items: Array<{
    videoPath: string;
    subtitlePath: string;
    options?: {
      splitPenalty?: number;
      noSplits?: boolean;
    };
  }>
): Promise<{
  success: boolean;
  queue: SubtitleSyncQueueItem[];
}> {
  const validItems = await Promise.all(
    items.map(async (item) => ({
      ...item,
      isValid: await isValidVideoFile(item.videoPath) && await isValidSubtitleFile(item.subtitlePath),
    })),
  );

  const validInputs = validItems.filter((item) => item.isValid);

  if (validInputs.length > 0) {
    for (const item of validInputs) {
      await getSubtitleSyncQueueInstance().add(item.videoPath, item.subtitlePath, item.options);
    }
    return {
      success: true,
      queue: getSubtitleSyncQueueInstance().getQueue(),
    };
  }
  return {
    success: false,
    queue: getSubtitleSyncQueueInstance().getQueue(),
  };
}

export function pauseSubtitleSyncItem(id: string): {
  success: boolean;
  queue: SubtitleSyncQueueItem[];
} {
  return getSubtitleSyncQueueInstance().pauseItem(id);
}

export function unpauseSubtitleSyncItem(id: string): {
  success: boolean;
  queue: SubtitleSyncQueueItem[];
} {
  return getSubtitleSyncQueueInstance().unpauseItem(id);
}

export function removeFromSubtitleSyncQueue(id: string): {
  success: boolean;
  queue: SubtitleSyncQueueItem[];
} {
  return getSubtitleSyncQueueInstance().removeItem(id);
}

export function isSubtitleSyncItemPaused(id: string): boolean {
  return getSubtitleSyncQueueInstance().isItemPaused(id);
}

export function getCurrentSubtitleSyncProcessingItem(): SubtitleSyncQueueItem | null {
  return getSubtitleSyncQueueInstance().getCurrentProcessingItem();
}

export async function getSubtitleSyncQueue(): Promise<SubtitleSyncQueueItem[]> {
  return await subtitleSyncQueueDataService.getAllSubtitleSyncQueueItems();
}

export function initializeSubtitleSyncQueue() {
  getSubtitleSyncQueueInstance().initializeProcessing();
}

export async function swapSubtitleSyncQueueItems(
  id1: string,
  id2: string,
): Promise<{ success: boolean; queue: SubtitleSyncQueueItem[] }> {
  return await getSubtitleSyncQueueInstance().swapQueueItems(id1, id2);
}

async function processSubtitleSync(
  queueItem: SubtitleSyncQueueItem,
  queue: SubtitleSyncQueue,
  progressIntervalMs: number,
): Promise<void> {
  const mainWindow = getMainWindow();
  const socketIo = getSocketIoGlobal();

  if (!queueItem.videoPath || !queueItem.subtitlePath || !queueItem.id) {
    throw new Error("Invalid queue item: missing required properties (id, videoPath, or subtitlePath)");
  }

  loggingService.info(`Starting subtitle sync for ${queueItem.fileName}`);
  
  // Update status to processing and notify frontend
  const processingUpdate = {
    queue: queue.getQueue().map((item) => {
      if (item.id === queueItem.id) {
        return { ...queueItem, status: "processing" as const, percent: 10 };
      }
      return item;
    }),
  };
  
  mainWindow?.webContents.send("subtitle-sync-progress", processingUpdate);
  if (socketIo) {
    socketIo.emit(AppSocketEvents.SUBTITLE_SYNC_PROGRESS, processingUpdate);
  }

  try {
    // Perform the subtitle sync using alass
    const syncOptions = {
      splitPenalty: queueItem.splitPenalty,
      noSplits: queueItem.noSplits,
    };
    
    const syncedSubtitlePath = await syncSubtitleWithAlass(
      queueItem.videoPath,
      queueItem.subtitlePath,
      syncOptions
    );

    // Update the queue item with the synced subtitle path
    queueItem.syncedSubtitlePath = syncedSubtitlePath;
    queueItem.status = "completed";
    queueItem.percent = 100;
    
    if (queueItem.id) {
      await subtitleSyncQueueDataService.putSubtitleSyncQueueItem(queueItem.id, queueItem);
    }

    loggingService.info(`Subtitle sync completed: ${syncedSubtitlePath}`);

    // Update the video database with the synced subtitle
    try {
      const videoData = await videoDbDataService.getVideo(queueItem.videoPath);
      if (videoData) {
        // Update the appropriate subtitle path based on the original subtitle path
        const updatedData = { ...videoData };
        
        // Determine which subtitle language this was for based on the original path
        if (videoData.subtitlePath === queueItem.subtitlePath) {
          updatedData.subtitlePath = syncedSubtitlePath;
        } else if (videoData.subtitlePathEs === queueItem.subtitlePath) {
          updatedData.subtitlePathEs = syncedSubtitlePath;
        } else if (videoData.subtitlePathFr === queueItem.subtitlePath) {
          updatedData.subtitlePathFr = syncedSubtitlePath;
        }
        
        await videoDbDataService.putVideo(queueItem.videoPath, updatedData);
        loggingService.info(`Updated video database with synced subtitle: ${queueItem.videoPath}`);
      }
    } catch (error) {
      loggingService.error("Failed to update video database with synced subtitle:", error);
    }

    // Notify completion
    const completedUpdate = {
      queue: queue.getQueue().map((item) => {
        if (item.id === queueItem.id) {
          return { ...queueItem, status: "completed" as const, percent: 100 };
        }
        return item;
      }),
      queueItem,
    };
    
    mainWindow?.webContents.send("subtitle-sync-completed", completedUpdate);
    if (socketIo) {
      socketIo.emit(AppSocketEvents.SUBTITLE_SYNC_COMPLETED, completedUpdate);
    }
    
  } catch (error) {
    loggingService.error(`Subtitle sync failed for ${queueItem.fileName}:`, error);
    throw error; // Re-throw to be handled by the queue processor
  }
}

async function isValidVideoFile(filePath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(filePath);
    const ext = path.extname(filePath).toLowerCase();
    return stats.isFile() && VIDEO_EXTENSIONS.has(ext);
  } catch (error) {
    loggingService.error(`Error checking video file ${filePath}:`, error);
    return false;
  }
}

async function isValidSubtitleFile(filePath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(filePath);
    const ext = path.extname(filePath).toLowerCase();
    return stats.isFile() && SUBTITLE_EXTENSIONS.has(ext);
  } catch (error) {
    loggingService.error(`Error checking subtitle file ${filePath}:`, error);
    return false;
  }
}