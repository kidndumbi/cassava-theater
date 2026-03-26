import { ipcMain } from "electron";
import { SubtitleSyncIPCChannels } from "../../enums/subtitleSyncIPCChannels.enum";
import {
  addToSubtitleSyncQueue,
  addToSubtitleSyncQueueBulk,
  pauseSubtitleSyncItem,
  unpauseSubtitleSyncItem,
  isSubtitleSyncItemPaused,
  getCurrentSubtitleSyncProcessingItem,
  getSubtitleSyncQueue,
  removeFromSubtitleSyncQueue,
  initializeSubtitleSyncQueue,
  swapSubtitleSyncQueueItems,
} from "../services/subtitleSync.service";

export const subtitleSyncIpcHandlers = () => {
  ipcMain.handle(
    SubtitleSyncIPCChannels.AddToSyncQueue,
    async (
      _event: Electron.IpcMainInvokeEvent,
      videoPath: string,
      subtitlePath: string,
      options?: { splitPenalty?: number; noSplits?: boolean }
    ) => {
      return addToSubtitleSyncQueue(videoPath, subtitlePath, options);
    },
  );
  
  ipcMain.handle(
    SubtitleSyncIPCChannels.AddToSyncQueueBulk,
    async (
      _event: Electron.IpcMainInvokeEvent,
      items: Array<{
        videoPath: string;
        subtitlePath: string;
        options?: { splitPenalty?: number; noSplits?: boolean };
      }>
    ) => {
      return addToSubtitleSyncQueueBulk(items);
    },
  );
  
  ipcMain.handle(
    SubtitleSyncIPCChannels.PauseSyncItem,
    async (_event: Electron.IpcMainInvokeEvent, id: string) => {
      return pauseSubtitleSyncItem(id);
    },
  );
  
  ipcMain.handle(
    SubtitleSyncIPCChannels.UnpauseSyncItem,
    async (_event: Electron.IpcMainInvokeEvent, id: string) => {
      return unpauseSubtitleSyncItem(id);
    },
  );
  
  ipcMain.handle(
    SubtitleSyncIPCChannels.IsItemPaused,
    async (_event: Electron.IpcMainInvokeEvent, id: string) => {
      return isSubtitleSyncItemPaused(id);
    },
  );
  
  ipcMain.handle(
    SubtitleSyncIPCChannels.GetCurrentProcessingItem,
    async () => {
      return getCurrentSubtitleSyncProcessingItem();
    },
  );
  
  ipcMain.handle(
    SubtitleSyncIPCChannels.GetSyncQueue,
    async () => {
      return await getSubtitleSyncQueue();
    },
  );
  
  ipcMain.handle(
    SubtitleSyncIPCChannels.RemoveFromSyncQueue,
    async (_event: Electron.IpcMainInvokeEvent, id: string) => {
      return removeFromSubtitleSyncQueue(id);
    },
  );
  
  ipcMain.handle(
    SubtitleSyncIPCChannels.InitializeSyncQueue,
    async () => {
      initializeSubtitleSyncQueue();
      return true;
    },
  );
  
  ipcMain.handle(
    SubtitleSyncIPCChannels.SwapQueueItems,
    async (_event: Electron.IpcMainInvokeEvent, id1: string, id2: string) => {
      return swapSubtitleSyncQueueItems(id1, id2);
    },
  );
};