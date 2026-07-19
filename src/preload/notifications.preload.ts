import { contextBridge, ipcRenderer } from "electron";
import { ConversionQueueItem } from "../models/conversion-queue-item.model";
import { SubtitleGenerationQueueItem } from "../models/subtitle-generation-queue-item.model";
import { SubtitleSyncQueueItem } from "../models/subtitle-sync-queue-item.model";
import { YoutubeDownloadQueueItem } from "../main/services/youtube.service";
import { LlmResponseChunk } from "../models/llm-response-chunk.model";

export function exposeNotificationsApi() {
  contextBridge.exposeInMainWorld("myAPI", {
    desktop: false,
  });

  contextBridge.exposeInMainWorld("mainNotificationsAPI", {
    userConnected: (callback: (userId: string) => void) => {
      ipcRenderer.on("user-connected", (_event, userId: string) => callback(userId));
    },
    userDisconnected: (callback: (userId: string) => void) => {
      ipcRenderer.on("user-disconnected", (_event, userId: string) => callback(userId));
    },
    mp4ConversionProgress: (callback: (progress: { queue: ConversionQueueItem[] }) => void) => {
      ipcRenderer.on("mp4-conversion-progress", (_event, progress: { queue: ConversionQueueItem[] }) => callback(progress));
    },
    mp4ConversionUpdatedFromBackend: (callback: (progress: { queue: ConversionQueueItem[] }) => void) => {
      ipcRenderer.on("mp4-conversion-update-from-backend", (_event, progress: { queue: ConversionQueueItem[] }) => callback(progress));
    },
    mp4ConversionCompleted: (callback: (progress: { queueItem: ConversionQueueItem; queue: ConversionQueueItem[] }) => void) => {
      ipcRenderer.on("mp4-conversion-completed", (_event, progress: { queueItem: ConversionQueueItem; queue: ConversionQueueItem[] }) => callback(progress));
    },
    subtitleGenerationProgress: (callback: (progress: { queue: SubtitleGenerationQueueItem[] }) => void) => {
      ipcRenderer.on("subtitle-generation-progress", (_event, progress: { queue: SubtitleGenerationQueueItem[] }) => callback(progress));
    },
    subtitleGenerationUpdatedFromBackend: (callback: (progress: { queue: SubtitleGenerationQueueItem[] }) => void) => {
      ipcRenderer.on("subtitle-generation-update-from-backend", (_event, progress: { queue: SubtitleGenerationQueueItem[] }) => callback(progress));
    },
    subtitleGenerationCompleted: (callback: (progress: { queueItem: SubtitleGenerationQueueItem; subtitlePath: string }) => void) => {
      ipcRenderer.on("subtitle-generation-complete", (_event, progress: { queueItem: SubtitleGenerationQueueItem; subtitlePath: string }) => callback(progress));
    },
    subtitleSyncProgress: (callback: (progress: { queue: SubtitleSyncQueueItem[] }) => void) => {
      ipcRenderer.on("subtitle-sync-progress", (_event, progress: { queue: SubtitleSyncQueueItem[] }) => callback(progress));
    },
    subtitleSyncUpdatedFromBackend: (callback: (progress: { queue: SubtitleSyncQueueItem[] }) => void) => {
      ipcRenderer.on("subtitle-sync-update-from-backend", (_event, progress: { queue: SubtitleSyncQueueItem[] }) => callback(progress));
    },
    subtitleSyncCompleted: (callback: (progress: { queueItem: SubtitleSyncQueueItem; queue: SubtitleSyncQueueItem[] }) => void) => {
      ipcRenderer.on("subtitle-sync-completed", (_event, progress: { queueItem: SubtitleSyncQueueItem; queue: SubtitleSyncQueueItem[] }) => callback(progress));
    },
    youtubeDownloadProgress: (callback: (progress: { queue: YoutubeDownloadQueueItem[] }) => void) => {
      ipcRenderer.on("youtube-download-progress", (_event, progress: { queue: YoutubeDownloadQueueItem[] }) => callback(progress));
    },
    youtubeDownloadCompleted: (callback: (data: { queue: YoutubeDownloadQueueItem[]; completedItem: YoutubeDownloadQueueItem }) => void) => {
      ipcRenderer.on("youtube-download-completed", (_event, data: { queue: YoutubeDownloadQueueItem[]; completedItem: YoutubeDownloadQueueItem }) => callback(data));
    },
    youtubeDownloadStarted: (callback: (queue: YoutubeDownloadQueueItem[]) => void) => {
      ipcRenderer.on("youtube-download-started", (_event, queue: YoutubeDownloadQueueItem[]) => callback(queue));
    },
    youtubeDownloadUpdatedFromBackend: (callback: (queue: YoutubeDownloadQueueItem[]) => void) => {
      ipcRenderer.on("youtube-download-update-from-backend", (_event, queue: YoutubeDownloadQueueItem[]) => callback(queue));
    },
    videoAiChatDataChunks: (callback: (chatResponseChunk: LlmResponseChunk) => void) => {
      ipcRenderer.on("video-ai-chat-data-chunks", (_event, chatResponseChunk: LlmResponseChunk) => callback(chatResponseChunk));
    },
    videoAiChatResponseError: (callback: (error: string) => void) => {
      ipcRenderer.on("video-ai-chat-response-error", (_event, error: string) => callback(error));
    },
  });
}