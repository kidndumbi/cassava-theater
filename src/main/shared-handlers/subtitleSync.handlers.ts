import { ipcMain, BrowserWindow } from "electron";
import { Socket } from "socket.io";
import { SubtitleSyncIPCChannels } from "../../enums/subtitleSyncIPCChannels.enum";
import { AppSocketEvents } from "../../enums/app-socket-events.enum";
import {
  addToSubtitleSyncQueue, addToSubtitleSyncQueueBulk, pauseSubtitleSyncItem,
  unpauseSubtitleSyncItem, isSubtitleSyncItemPaused, getCurrentSubtitleSyncProcessingItem,
  getSubtitleSyncQueue, removeFromSubtitleSyncQueue, initializeSubtitleSyncQueue,
  swapSubtitleSyncQueueItems,
} from "../services/subtitleSync.service";
import { loggingService as log } from "../services/main-logging.service";

export const registerSubtitleSyncHandlers = {
  ipc(): void {
    ipcMain.handle(SubtitleSyncIPCChannels.AddToSyncQueue, async (_event, videoPath: string, subtitlePath: string, options?: { splitPenalty?: number; noSplits?: boolean }) => addToSubtitleSyncQueue(videoPath, subtitlePath, options));
    ipcMain.handle(SubtitleSyncIPCChannels.AddToSyncQueueBulk, async (_event, items: Array<{ videoPath: string; subtitlePath: string; options?: { splitPenalty?: number; noSplits?: boolean } }>) => addToSubtitleSyncQueueBulk(items));
    ipcMain.handle(SubtitleSyncIPCChannels.PauseSyncItem, async (_event, id: string) => pauseSubtitleSyncItem(id));
    ipcMain.handle(SubtitleSyncIPCChannels.UnpauseSyncItem, async (_event, id: string) => unpauseSubtitleSyncItem(id));
    ipcMain.handle(SubtitleSyncIPCChannels.IsItemPaused, async (_event, id: string) => isSubtitleSyncItemPaused(id));
    ipcMain.handle(SubtitleSyncIPCChannels.GetCurrentProcessingItem, async () => getCurrentSubtitleSyncProcessingItem());
    ipcMain.handle(SubtitleSyncIPCChannels.GetSyncQueue, async () => await getSubtitleSyncQueue());
    ipcMain.handle(SubtitleSyncIPCChannels.RemoveFromSyncQueue, async (_event, id: string) => removeFromSubtitleSyncQueue(id));
    ipcMain.handle(SubtitleSyncIPCChannels.InitializeSyncQueue, async () => { initializeSubtitleSyncQueue(); return true; });
    ipcMain.handle(SubtitleSyncIPCChannels.SwapQueueItems, async (_event, id1: string, id2: string) => swapSubtitleSyncQueueItems(id1, id2));
  },

  socket(socket: Socket, mainWindow: BrowserWindow): void {
    socket.on(AppSocketEvents.SUBTITLE_SYNC_REMOVE_FROM_QUEUE, async (id: string) => {
      try {
        const result = await removeFromSubtitleSyncQueue(id);
        if (result.success) {
          mainWindow.webContents.send("subtitle-sync-update-from-backend", { queue: result.queue });
        }
      } catch (error) { log.error("Error removing subtitle sync item:", error); }
    });
  },
};