import { contextBridge, ipcRenderer } from "electron";
import { SubtitleSyncIPCChannels } from "../enums/subtitleSyncIPCChannels.enum";

export function exposeSubtitleSyncApi() {
  contextBridge.exposeInMainWorld("subtitleSyncAPI", {
    addToSyncQueue: (videoPath: string, subtitlePath: string, options?: { splitPenalty?: number; noSplits?: boolean }) =>
      ipcRenderer.invoke(SubtitleSyncIPCChannels.AddToSyncQueue, videoPath, subtitlePath, options),
    addToSyncQueueBulk: (items: Array<{ videoPath: string; subtitlePath: string; options?: { splitPenalty?: number; noSplits?: boolean } }>) =>
      ipcRenderer.invoke(SubtitleSyncIPCChannels.AddToSyncQueueBulk, items),
    pauseSyncItem: (id: string) => ipcRenderer.invoke(SubtitleSyncIPCChannels.PauseSyncItem, id),
    unpauseSyncItem: (id: string) => ipcRenderer.invoke(SubtitleSyncIPCChannels.UnpauseSyncItem, id),
    isItemPaused: (id: string) => ipcRenderer.invoke(SubtitleSyncIPCChannels.IsItemPaused, id),
    getCurrentProcessingItem: () => ipcRenderer.invoke(SubtitleSyncIPCChannels.GetCurrentProcessingItem),
    getSyncQueue: () => ipcRenderer.invoke(SubtitleSyncIPCChannels.GetSyncQueue),
    removeFromSyncQueue: (id: string) => ipcRenderer.invoke(SubtitleSyncIPCChannels.RemoveFromSyncQueue, id),
    initializeSyncQueue: () => ipcRenderer.invoke(SubtitleSyncIPCChannels.InitializeSyncQueue),
    swapQueueItems: (id1: string, id2: string) => ipcRenderer.invoke(SubtitleSyncIPCChannels.SwapQueueItems, id1, id2),
  });
}