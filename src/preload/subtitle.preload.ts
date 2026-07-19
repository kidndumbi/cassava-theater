import { contextBridge, ipcRenderer } from "electron";
import { SubtitleIPCChannels } from "../enums/subtitleIPCChannels.enum";
import { SubtitleGenerationRequest, SubtitleGenerationResponse, SubtitleGeneration } from "../models/subtitle.model";

export function exposeSubtitleApi() {
  contextBridge.exposeInMainWorld("subtitleAPI", {
    generateSubtitles: (request: SubtitleGenerationRequest): Promise<SubtitleGenerationResponse> =>
      ipcRenderer.invoke(SubtitleIPCChannels.GenerateSubtitles, request),
    checkSubtitleStatus: (jobId: string): Promise<SubtitleGeneration | null> =>
      ipcRenderer.invoke(SubtitleIPCChannels.CheckSubtitleStatus, jobId),
    getExistingSubtitles: (videoPath: string): Promise<string[]> =>
      ipcRenderer.invoke(SubtitleIPCChannels.GetExistingSubtitles, videoPath),
    addToSubtitleGenerationQueue: (inputPath: string, language?: string, format?: string, model?: string) =>
      ipcRenderer.invoke(SubtitleIPCChannels.AddToSubtitleGenerationQueue, inputPath, language, format, model),
    addToSubtitleGenerationQueueBulk: (inputPaths: string[], language?: string, format?: string, model?: string) =>
      ipcRenderer.invoke(SubtitleIPCChannels.AddToSubtitleGenerationQueueBulk, inputPaths, language, format, model),
    pauseSubtitleGenerationItem: (id: string) => ipcRenderer.invoke(SubtitleIPCChannels.PauseSubtitleGenerationItem, id),
    unpauseSubtitleGenerationItem: (id: string) => ipcRenderer.invoke(SubtitleIPCChannels.UnpauseSubtitleGenerationItem, id),
    isSubtitleItemPaused: (id: string) => ipcRenderer.invoke(SubtitleIPCChannels.IsSubtitleItemPaused, id),
    getCurrentProcessingSubtitleItem: () => ipcRenderer.invoke(SubtitleIPCChannels.GetCurrentProcessingSubtitleItem),
    getSubtitleGenerationQueue: () => ipcRenderer.invoke(SubtitleIPCChannels.GetSubtitleGenerationQueue),
    removeFromSubtitleGenerationQueue: (id: string) => ipcRenderer.invoke(SubtitleIPCChannels.RemoveFromSubtitleGenerationQueue, id),
    initializeSubtitleGenerationQueue: () => ipcRenderer.invoke(SubtitleIPCChannels.InitializeSubtitleGenerationQueue),
    swapSubtitleQueueItems: (id1: string, id2: string) => ipcRenderer.invoke(SubtitleIPCChannels.SwapSubtitleQueueItems, id1, id2),
  });
}