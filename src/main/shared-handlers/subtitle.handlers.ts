import { ipcMain, BrowserWindow } from "electron";
import { Socket } from "socket.io";
import { SubtitleIPCChannels } from "../../enums/subtitleIPCChannels.enum";
import { AppSocketEvents } from "../../enums/app-socket-events.enum";
import {
  getExistingSubtitles, addToSubtitleGenerationQueue, addToSubtitleGenerationQueueBulk,
  getSubtitleGenerationQueue, removeFromSubtitleGenerationQueue,
  pauseSubtitleGenerationQueueItem, unpauseSubtitleGenerationQueueItem,
  swapSubtitleGenerationQueueItems, initializeSubtitleGenerationService,
} from "../services/subtitle.service";
import { loggingService as log } from "../services/main-logging.service";

export const registerSubtitleHandlers = {
  ipc(): void {
    ipcMain.handle(SubtitleIPCChannels.GenerateSubtitles, async (_event, request: { videoPath: string; language?: string; format?: string; model?: string }) => {
      const result = await addToSubtitleGenerationQueue(request.videoPath, request.language, request.format, request.model);
      return { success: result.success, jobId: result.success ? result.queue[result.queue.length - 1]?.id : undefined };
    });
    ipcMain.handle(SubtitleIPCChannels.CheckSubtitleStatus, async (_event, jobId: string) => {
      const queue = getSubtitleGenerationQueue();
      const item = queue.find(qi => qi.id === jobId);
      if (!item || !item.videoPath) return null;
      return { videoPath: item.videoPath, subtitlePath: `${item.videoPath.split('.').slice(0, -1).join('.')}.${item.format}`, status: item.status, language: item.language, format: item.format, progress: item.percent, error: item.error, createdAt: new Date(), completedAt: item.status === 'completed' ? new Date() : undefined };
    });
    ipcMain.handle(SubtitleIPCChannels.GetExistingSubtitles, async (_event, videoPath: string) => getExistingSubtitles(videoPath));
    ipcMain.handle(SubtitleIPCChannels.AddToSubtitleGenerationQueue, async (_event, inputPath: string, language?: string, format?: string, model?: string) => addToSubtitleGenerationQueue(inputPath, language, format, model));
    ipcMain.handle(SubtitleIPCChannels.AddToSubtitleGenerationQueueBulk, async (_event, inputPaths: string[], language?: string, format?: string, model?: string) => addToSubtitleGenerationQueueBulk(inputPaths, language, format, model));
    ipcMain.handle(SubtitleIPCChannels.PauseSubtitleGenerationItem, async (_event, id: string) => pauseSubtitleGenerationQueueItem(id));
    ipcMain.handle(SubtitleIPCChannels.UnpauseSubtitleGenerationItem, async (_event, id: string) => unpauseSubtitleGenerationQueueItem(id));
    ipcMain.handle(SubtitleIPCChannels.IsSubtitleItemPaused, async (_event, id: string) => {
      const queue = getSubtitleGenerationQueue();
      return queue.find(qi => qi.id === id)?.status === "paused" || false;
    });
    ipcMain.handle(SubtitleIPCChannels.GetCurrentProcessingSubtitleItem, async () => {
      const queue = getSubtitleGenerationQueue();
      return queue.find(item => item.status === "processing") || null;
    });
    ipcMain.handle(SubtitleIPCChannels.GetSubtitleGenerationQueue, async () => getSubtitleGenerationQueue());
    ipcMain.handle(SubtitleIPCChannels.RemoveFromSubtitleGenerationQueue, async (_event, id: string) => removeFromSubtitleGenerationQueue(id));
    ipcMain.handle(SubtitleIPCChannels.InitializeSubtitleGenerationQueue, async () => { await initializeSubtitleGenerationService(); return true; });
    ipcMain.handle(SubtitleIPCChannels.SwapSubtitleQueueItems, async (_event, id1: string, id2: string) => swapSubtitleGenerationQueueItems(id1, id2));
  },

  socket(socket: Socket, mainWindow: BrowserWindow): void {
    socket.on(AppSocketEvents.SUBTITLE_GENERATION_REMOVE_FROM_QUEUE, async (id: string) => {
      try {
        const result = await removeFromSubtitleGenerationQueue(id);
        if (result.success) {
          mainWindow.webContents.send("subtitle-generation-update-from-backend", { queue: result.queue });
        }
      } catch (error) { log.error("Error removing subtitle generation item:", error); }
    });
  },
};