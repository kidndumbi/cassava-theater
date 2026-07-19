import { contextBridge, ipcRenderer } from "electron";
import { YoutubeIPCChannels } from "../enums/youtubeIPCChannels.enum";

export function exposeYoutubeApi() {
  contextBridge.exposeInMainWorld("youtubeAPI", {
    getVideoInfo: (url: string) => ipcRenderer.invoke(YoutubeIPCChannels.GetVideoInfo, url),
    downloadVideo: (url: string, destinationPath: string) =>
      ipcRenderer.invoke(YoutubeIPCChannels.DownloadVideo, url, destinationPath),
    addToDownloadQueue: (queueItem: { title: string; url: string; destinationPath: string; poster: string; backdrop: string }) =>
      ipcRenderer.invoke(YoutubeIPCChannels.AddToDownloadQueue, queueItem),
    removeFromQueue: (id: string) => ipcRenderer.invoke(YoutubeIPCChannels.RemoveFromQueue, id),
    isProcessingQueue: () => ipcRenderer.invoke(YoutubeIPCChannels.IsProcessingQueue),
    clearQueue: () => ipcRenderer.invoke(YoutubeIPCChannels.ClearQueue),
    getQueue: () => ipcRenderer.invoke(YoutubeIPCChannels.GetQueue),
    swapQueueItems: (id1: string, id2: string) => ipcRenderer.invoke(YoutubeIPCChannels.SwapQueueItems, id1, id2),
    processQueue: () => ipcRenderer.invoke(YoutubeIPCChannels.ProcessQueue),
    setIsProcessing: (isProcessing: boolean) => ipcRenderer.invoke(YoutubeIPCChannels.SetIsProcessing, isProcessing),
    setProgressIntervalMs: (ms: number) => ipcRenderer.invoke(YoutubeIPCChannels.SetProgressIntervalMs, ms),
    getProgressIntervalMs: () => ipcRenderer.invoke(YoutubeIPCChannels.GetProgressIntervalMs),
  });
}