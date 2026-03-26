import { ipcMain } from "electron";
import { SubtitleIPCChannels } from "../../enums/subtitleIPCChannels.enum";
import {
  // Legacy functions for compatibility (these don't exist in new service but I'll handle them)
  getExistingSubtitles,
  // New queue management functions
  addToSubtitleGenerationQueue,
  addToSubtitleGenerationQueueBulk,
  getSubtitleGenerationQueue,
  removeFromSubtitleGenerationQueue,
  pauseSubtitleGenerationQueueItem,
  unpauseSubtitleGenerationQueueItem,
  swapSubtitleGenerationQueueItems,
  initializeSubtitleGenerationService,
} from "../services/subtitle.service";

export const subtitleIpcHandlers = () => {
  // Legacy handlers for backward compatibility (simplified)
  ipcMain.handle(
    SubtitleIPCChannels.GenerateSubtitles,
    async (
      _event: Electron.IpcMainInvokeEvent,
      request: { videoPath: string; language?: string; format?: string; model?: string }
    ) => {
      // Convert to queue system
      const result = await addToSubtitleGenerationQueue(
        request.videoPath,
        request.language,
        request.format,
        request.model
      );
      return {
        success: result.success,
        jobId: result.success ? result.queue[result.queue.length - 1]?.id : undefined,
      };
    }
  );

  ipcMain.handle(
    SubtitleIPCChannels.CheckSubtitleStatus,
    async (
      _event: Electron.IpcMainInvokeEvent,
      jobId: string
    ) => {
      // Find the item in queue by ID and convert to legacy format
      const queue = getSubtitleGenerationQueue();
      const item = queue.find(queueItem => queueItem.id === jobId);
      if (!item) return null;
      
      return {
        videoPath: item.videoPath,
        subtitlePath: `${item.videoPath.split('.').slice(0, -1).join('.')}.${item.format}`,
        status: item.status,
        language: item.language,
        format: item.format,
        progress: item.percent,
        error: item.error,
        createdAt: new Date(), // We don't store createdAt in new model
        completedAt: item.status === 'completed' ? new Date() : undefined,
      };
    }
  );

  ipcMain.handle(
    SubtitleIPCChannels.GetExistingSubtitles,
    async (
      _event: Electron.IpcMainInvokeEvent,
      videoPath: string
    ): Promise<string[]> => {
      return await getExistingSubtitles(videoPath);
    }
  );

  // New queue management handlers
  ipcMain.handle(
    SubtitleIPCChannels.AddToSubtitleGenerationQueue,
    async (
      _event: Electron.IpcMainInvokeEvent,
      inputPath: string,
      language?: string,
      format?: string,
      model?: string
    ) => {
      return addToSubtitleGenerationQueue(inputPath, language, format, model);
    },
  );

  ipcMain.handle(
    SubtitleIPCChannels.AddToSubtitleGenerationQueueBulk,
    async (
      _event: Electron.IpcMainInvokeEvent,
      inputPaths: string[],
      language?: string,
      format?: string,
      model?: string
    ) => {
      return addToSubtitleGenerationQueueBulk(inputPaths, language, format, model);
    },
  );

  ipcMain.handle(
    SubtitleIPCChannels.PauseSubtitleGenerationItem,
    async (_event: Electron.IpcMainInvokeEvent, id: string) => {
      return pauseSubtitleGenerationQueueItem(id);
    },
  );

  ipcMain.handle(
    SubtitleIPCChannels.UnpauseSubtitleGenerationItem,
    async (_event: Electron.IpcMainInvokeEvent, id: string) => {
      return unpauseSubtitleGenerationQueueItem(id);
    },
  );

  ipcMain.handle(
    SubtitleIPCChannels.IsSubtitleItemPaused,
    async (_event: Electron.IpcMainInvokeEvent, id: string) => {
      const queue = getSubtitleGenerationQueue();
      const item = queue.find(queueItem => queueItem.id === id);
      return item?.status === "paused" || false;
    },
  );

  ipcMain.handle(
    SubtitleIPCChannels.GetCurrentProcessingSubtitleItem,
    async () => {
      const queue = getSubtitleGenerationQueue();
      return queue.find(item => item.status === "processing") || null;
    },
  );

  ipcMain.handle(
    SubtitleIPCChannels.GetSubtitleGenerationQueue,
    async () => {
      return getSubtitleGenerationQueue();
    },
  );

  ipcMain.handle(
    SubtitleIPCChannels.RemoveFromSubtitleGenerationQueue,
    async (_event: Electron.IpcMainInvokeEvent, id: string) => {
      return removeFromSubtitleGenerationQueue(id);
    },
  );

  ipcMain.handle(
    SubtitleIPCChannels.InitializeSubtitleGenerationQueue,
    async () => {
      await initializeSubtitleGenerationService();
      return true;
    },
  );

  ipcMain.handle(
    SubtitleIPCChannels.SwapSubtitleQueueItems,
    async (_event: Electron.IpcMainInvokeEvent, id1: string, id2: string) => {
      return swapSubtitleGenerationQueueItems(id1, id2);
    },
  );
};