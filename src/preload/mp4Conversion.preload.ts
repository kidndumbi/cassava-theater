import { contextBridge, ipcRenderer } from "electron";
import { Mp4ConversionIPCChannels } from "../enums/mp4ConversionIPCChannels.enum";

export function exposeMp4ConversionApi() {
  contextBridge.exposeInMainWorld("mp4ConversionAPI", {
    addToConversionQueue: (inputPath: string) => ipcRenderer.invoke(Mp4ConversionIPCChannels.AddToConversionQueue, inputPath),
    addToConversionQueueBulk: (inputPaths: string[]) => ipcRenderer.invoke(Mp4ConversionIPCChannels.AddToConversionQueueBulk, inputPaths),
    pauseConversionItem: (id: string) => ipcRenderer.invoke(Mp4ConversionIPCChannels.PauseConversionItem, id),
    unpauseConversionItem: (id: string) => ipcRenderer.invoke(Mp4ConversionIPCChannels.UnpauseConversionItem, id),
    isItemPaused: (id: string) => ipcRenderer.invoke(Mp4ConversionIPCChannels.IsItemPaused, id),
    getCurrentProcessingItem: () => ipcRenderer.invoke(Mp4ConversionIPCChannels.GetCurrentProcessingItem),
    getConversionQueue: () => ipcRenderer.invoke(Mp4ConversionIPCChannels.GetConversionQueue),
    removeFromConversionQueue: (id: string) => ipcRenderer.invoke(Mp4ConversionIPCChannels.RemoveFromConversionQueue, id),
    initializeConversionQueue: () => ipcRenderer.invoke(Mp4ConversionIPCChannels.InitializeConversionQueue),
    swapQueueItems: (id1: string, id2: string) => ipcRenderer.invoke(Mp4ConversionIPCChannels.SwapQueueItems, id1, id2),
  });
}