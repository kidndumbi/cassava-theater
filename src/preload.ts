import "electron-log/preload";
import { SettingsIpcChannels } from "./enums/settings-IPC-channels.enum";
// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";
import { SettingsModel } from "./models/settings.model";
import { OpenDialogIpcChannels } from "./enums/open-dialog-IPC-channels.enum";
import { VideoCommands } from "./models/video-commands.model";
import { VideoIPCChannels } from "./enums/VideoIPCChannels";
import { MainUtilIPCChannels } from "./enums/main-util-IPC-channels";
import { VideoDataModel } from "./models/videoData.model";
import { TheMovieDbIPCChannels } from "./enums/TheMovieDbIPCChannels";
import { SetPlayingModel } from "./models/set-playing.model";
import { MovieDetails } from "./models/movie-detail.model";
import { TvShowDetails } from "./models/tv-show-details.model";
import { TranslationIPCChannels } from "./enums/translationIPCChannels.enum";
import { FileIPCChannels } from "./enums/fileIPCChannels";
import { Mp4ConversionIPCChannels } from "./enums/mp4ConversionIPCChannels.enum";
import { PlaylistIPCChannels } from "./enums/playlist-IPC-Channels.enum";
import { PlaylistModel } from "./models/playlist.model";
import { YoutubeIPCChannels } from "./enums/youtubeIPCChannels.enum";
import { YoutubeDownloadQueueItem } from "./main/services/youtube.service";
import { PlaylistPlayRequestModel } from "./models/playlistPlayRequest.model";
import { PlaylistCommands } from "./models/playlist-commands.model";
import { AppSocketEvents } from "./enums/app-socket-events.enum";
import { CurrentlyPlayingIPCChannels } from "./enums/currently-playing-IPCChannels.enum";
import { ConversionQueueItem } from "./models/conversion-queue-item.model";
import { LlmIPCChannels, LanguageLearningIPCChannels } from "./enums/llm-IPC-Channels.enum";
import { LlmResponseChunk } from "./models/llm-response-chunk.model";
import { SubtitleIPCChannels } from "./enums/subtitleIPCChannels.enum";
import { SubtitleSyncIPCChannels } from "./enums/subtitleSyncIPCChannels.enum";
import { SubtitleGenerationQueueItem } from "./models/subtitle-generation-queue-item.model";
import { SubtitleSyncQueueItem } from "./models/subtitle-sync-queue-item.model";
import { 
  SubtitleGenerationRequest, 
  SubtitleGenerationResponse, 
  SubtitleGeneration 
} from "./models/subtitle.model";

contextBridge.exposeInMainWorld("myAPI", {
  desktop: false,
});

contextBridge.exposeInMainWorld("mainUtilAPI", {
  isPackaged: () =>
    ipcRenderer.invoke(MainUtilIPCChannels.IS_PACKAGED) as Promise<boolean>,
  restart: () => ipcRenderer.send("restart-app"),
  openExternalLink: (url: string) =>
    ipcRenderer.invoke(
      MainUtilIPCChannels.OPEN_EXTERNAL_LINK,
      url,
    ) as Promise<void>,
});

contextBridge.exposeInMainWorld("settingsAPI", {
  getALLSettings: () => {
    return ipcRenderer.invoke(
      SettingsIpcChannels.GET_ALL_SETTINGS,
    ) as Promise<SettingsModel>;
  },
  getSetting: (key: keyof SettingsModel) => {
    return ipcRenderer.invoke(SettingsIpcChannels.GET_SETTING, key) as Promise<
      SettingsModel[keyof SettingsModel]
    >;
  },
  setSetting: (
    key: keyof SettingsModel,
    value: SettingsModel[keyof SettingsModel],
  ) => {
    return ipcRenderer.invoke(
      SettingsIpcChannels.SET_SETTING,
      key,
      value,
    ) as Promise<SettingsModel[keyof SettingsModel]>;
  },
});

contextBridge.exposeInMainWorld("openDialogAPI", {
  openFileDialog: (filters?: { name: string; extensions: string[] }[]) => {
    return ipcRenderer.invoke(
      OpenDialogIpcChannels.OPEN_FILE_DIALOG,
      filters,
    ) as Promise<string | null>;
  },
  openFolderDialog: () => {
    return ipcRenderer.invoke(
      OpenDialogIpcChannels.OPEN_FOLDER_DIALOG,
    ) as Promise<string | null>;
  },
});

contextBridge.exposeInMainWorld("playlistCommandsAPI", {
  playlistVideoCommand: (callback: (command: PlaylistCommands) => void) => {
    ipcRenderer.on(
      AppSocketEvents.PLAYLIST_REMOTE_COMMAND,
      (_event, command: PlaylistCommands) => callback(command),
    );
  },
});

contextBridge.exposeInMainWorld("currentlyPlayingAPI", {
  setCurrentVideo: (video: VideoDataModel) => {
    return ipcRenderer.invoke(
      CurrentlyPlayingIPCChannels.SetCurrentVideo,
      video,
    );
  },
  setCurrentPlaylist: (args: {
    playlist: Partial<PlaylistModel>;
    shuffle?: boolean;
  }) => {
    return ipcRenderer.invoke(
      CurrentlyPlayingIPCChannels.SetCurrentPlaylist,
      args,
    );
  },
  setCurrentTime: (currentTime: number) => {
    return ipcRenderer.invoke(
      CurrentlyPlayingIPCChannels.SET_CURRENTLY_PLAYING_CURRENTTIME,
      currentTime,
    );
  },
  getCurrentPlaylist: () => {
    return ipcRenderer.invoke(CurrentlyPlayingIPCChannels.GetCurrentPlaylist);
  },
  getPlaylistVideos: () => {
    return ipcRenderer.invoke(CurrentlyPlayingIPCChannels.GetPlaylistVideos);
  },
  getNextPlaylistVideo: () => {
    return ipcRenderer.invoke(CurrentlyPlayingIPCChannels.GetNextPlaylistVideo);
  },
  getPreviousPlaylistVideo: () => {
    return ipcRenderer.invoke(
      CurrentlyPlayingIPCChannels.GetPreviousPlaylistVideo,
    );
  },
  getCurrentVideo: () => {
    return ipcRenderer.invoke(CurrentlyPlayingIPCChannels.GetCurrentVideo);
  },
});

contextBridge.exposeInMainWorld("videoCommandsAPI", {
  videoCommand: (callback: (command: VideoCommands) => void) => {
    ipcRenderer.on(
      "video-command",
      (event: Electron.IpcRendererEvent, command: VideoCommands) => {
        callback(command);
      },
    );
  },
  setCurrentVideo: (callback: (data: SetPlayingModel) => void) => {
    ipcRenderer.on(
      "set-current-video",
      (event: Electron.IpcRendererEvent, data: SetPlayingModel) => {
        callback(data);
      },
    );
  },
  setCurrentPlaylist: (callback: (data: PlaylistPlayRequestModel) => void) => {
    ipcRenderer.on(
      "set-current-playlist",
      (event: Electron.IpcRendererEvent, data: PlaylistPlayRequestModel) => {
        callback(data);
      },
    );
  },
});

contextBridge.exposeInMainWorld("mainNotificationsAPI", {
  userConnected: (callback: (userId: string) => void) => {
    ipcRenderer.on(
      "user-connected",
      (event: Electron.IpcRendererEvent, userId: string) => callback(userId),
    );
  },
  userDisconnected: (callback: (userId: string) => void) => {
    ipcRenderer.on(
      "user-disconnected",
      (event: Electron.IpcRendererEvent, userId: string) => callback(userId),
    );
  },
  mp4ConversionProgress: (
    callback: (progress: { queue: ConversionQueueItem[] }) => void,
  ) => {
    ipcRenderer.on(
      "mp4-conversion-progress",
      (
        event: Electron.IpcRendererEvent,
        progress: {
          queue: ConversionQueueItem[];
        },
      ) => callback(progress),
    );
  },
  mp4ConversionUpdatedFromBackend: (
    callback: (progress: { queue: ConversionQueueItem[] }) => void,
  ) => {
    ipcRenderer.on(
      "mp4-conversion-update-from-backend",
      (
        event: Electron.IpcRendererEvent,
        progress: {
          queue: ConversionQueueItem[];
        },
      ) => callback(progress),
    );
  },
  mp4ConversionCompleted: (
    callback: (progress: {
      queueItem: ConversionQueueItem;
      queue: ConversionQueueItem[];
    }) => void,
  ) => {
    ipcRenderer.on(
      "mp4-conversion-completed",
      (
        event: Electron.IpcRendererEvent,
        progress: {
          queueItem: ConversionQueueItem;
          queue: ConversionQueueItem[];
        },
      ) => callback(progress),
    );
  },
  subtitleGenerationProgress: (
    callback: (progress: { queue: SubtitleGenerationQueueItem[] }) => void,
  ) => {
    ipcRenderer.on(
      "subtitle-generation-progress",
      (
        event: Electron.IpcRendererEvent,
        progress: {
          queue: SubtitleGenerationQueueItem[];
        },
      ) => callback(progress),
    );
  },
  subtitleGenerationUpdatedFromBackend: (
    callback: (progress: { queue: SubtitleGenerationQueueItem[] }) => void,
  ) => {
    ipcRenderer.on(
      "subtitle-generation-update-from-backend",
      (
        event: Electron.IpcRendererEvent,
        progress: {
          queue: SubtitleGenerationQueueItem[];
        },
      ) => callback(progress),
    );
  },
  subtitleGenerationCompleted: (
    callback: (progress: {
      queueItem: SubtitleGenerationQueueItem;
      subtitlePath: string;
    }) => void,
  ) => {
    ipcRenderer.on(
      "subtitle-generation-complete",
      (
        event: Electron.IpcRendererEvent,
        progress: {
          queueItem: SubtitleGenerationQueueItem;
          subtitlePath: string;
        },
      ) => callback(progress),
    );
  },
  subtitleSyncProgress: (
    callback: (progress: { queue: SubtitleSyncQueueItem[] }) => void,
  ) => {
    ipcRenderer.on(
      "subtitle-sync-progress",
      (
        event: Electron.IpcRendererEvent,
        progress: {
          queue: SubtitleSyncQueueItem[];
        },
      ) => callback(progress),
    );
  },
  subtitleSyncUpdatedFromBackend: (
    callback: (progress: { queue: SubtitleSyncQueueItem[] }) => void,
  ) => {
    ipcRenderer.on(
      "subtitle-sync-update-from-backend",
      (
        event: Electron.IpcRendererEvent,
        progress: {
          queue: SubtitleSyncQueueItem[];
        },
      ) => callback(progress),
    );
  },
  subtitleSyncCompleted: (
    callback: (progress: {
      queueItem: SubtitleSyncQueueItem;
      queue: SubtitleSyncQueueItem[];
    }) => void,
  ) => {
    ipcRenderer.on(
      "subtitle-sync-completed",
      (
        event: Electron.IpcRendererEvent,
        progress: {
          queueItem: SubtitleSyncQueueItem;
          queue: SubtitleSyncQueueItem[];
        },
      ) => callback(progress),
    );
  },
  youtubeDownloadProgress: (
    callback: (progress: { queue: YoutubeDownloadQueueItem[] }) => void,
  ) => {
    ipcRenderer.on(
      "youtube-download-progress",
      (
        _event,
        progress: {
          queue: YoutubeDownloadQueueItem[];
        },
      ) => callback(progress),
    );
  },
  youtubeDownloadCompleted: (
    callback: (data: {
      queue: YoutubeDownloadQueueItem[];
      completedItem: YoutubeDownloadQueueItem;
    }) => void,
  ) => {
    ipcRenderer.on(
      "youtube-download-completed",
      (
        _event,
        data: {
          queue: YoutubeDownloadQueueItem[];
          completedItem: YoutubeDownloadQueueItem;
        },
      ) => callback(data),
    );
  },
  youtubeDownloadStarted: (
    callback: (queue: YoutubeDownloadQueueItem[]) => void,
  ) => {
    ipcRenderer.on(
      "youtube-download-started",
      (_event, queue: YoutubeDownloadQueueItem[]) => callback(queue),
    );
  },
  youtubeDownloadUpdatedFromBackend: (
    callback: (queue: YoutubeDownloadQueueItem[]) => void,
  ) => {
    ipcRenderer.on(
      "youtube-download-update-from-backend",
      (_event, queue: YoutubeDownloadQueueItem[]) => callback(queue),
    );
  },

  videoAiChatDataChunks: (
    callback: (chatResponseChunk: LlmResponseChunk) => void,
  ) => {
    ipcRenderer.on(
      "video-ai-chat-data-chunks",
      (_event, chatResponseChunk: LlmResponseChunk) =>
        callback(chatResponseChunk),
    );
  },
  videoAiChatResponseError: (callback: (error: string) => void) => {
    ipcRenderer.on("video-ai-chat-response-error", (_event, error: string) =>
      callback(error),
    );
  },
});

contextBridge.exposeInMainWorld("videoAPI", {
  fetchVideoData: (args: { filePath: string; includeThumbnail: boolean }) => {
    return ipcRenderer.invoke(VideoIPCChannels.FetchVideoData, args);
  },
  fetchVideoDetails: (args: { path: string; category: string }) => {
    return ipcRenderer.invoke(VideoIPCChannels.FetchVideoDetails, args);
  },
  fetchFolderDetails: (args: { path: string }): Promise<string> => {
    return ipcRenderer.invoke(VideoIPCChannels.FetchFolderDetails, args);
  },
  saveVideoDbCurrentTime: (args: {
    currentVideo: VideoDataModel;
    currentTime: number;
    isEpisode?: boolean;
  }) => {
    return ipcRenderer.invoke(VideoIPCChannels.SaveCurrentTime, args);
  },
  getVideoJsonData: (currentVideo: VideoDataModel) => {
    return ipcRenderer.invoke(VideoIPCChannels.GetVideoJsonData, currentVideo);
  },
  saveVideoJsonData: (args: {
    currentVideo: VideoDataModel;
    newVideoJsonData: VideoDataModel;
  }) => {
    return ipcRenderer.invoke(VideoIPCChannels.SaveVideoJsonData, args);
  },
  AddTvShowFolder: (args: {
    tvShowName: string;
    subfolders: string[];
    tvShowDetails: TvShowDetails | null;
    tvShowsFolderPath: string;
    poster: string;
    backdrop: string;
  }) => {
    return ipcRenderer.invoke(VideoIPCChannels.AddTvShowFolder, args);
  },
  getFolderFiles: (folderPath: string) => {
    return ipcRenderer.invoke(VideoIPCChannels.GetFolderFiles, folderPath);
  },
  getScreenshot: (videoData: VideoDataModel) => {
    return ipcRenderer.invoke(VideoIPCChannels.GetScreenshot, videoData);
  },
  fetchRecentlyWatchedVideosData: (args: {
    videoType: "movies" | "tvShows";
    limit?: number;
  }) => {
    return ipcRenderer.invoke(
      VideoIPCChannels.FetchRecentlyWatchedVideosData,
      args,
    );
  },
  fetchRecentlyWatchedCustomVideosData: (args: { limit?: number }) => {
    return ipcRenderer.invoke(
      VideoIPCChannels.FetchRecentlyWatchedCustomVideosData,
      args,
    );
  },
  fetchWatchlaterVideos: () => {
    return ipcRenderer.invoke(VideoIPCChannels.FetchWatchlaterVideos);
  },
});

contextBridge.exposeInMainWorld("theMovieDbAPI", {
  search: (query: string, queryType: "movie" | "tv") => {
    return ipcRenderer.invoke(
      TheMovieDbIPCChannels.Search,
      query,
      queryType,
    ) as Promise<MovieDetails[] | TvShowDetails[]>;
  },
  movieOrTvShow: (id: string, queryType: "movie" | "tv") => {
    return ipcRenderer.invoke(
      TheMovieDbIPCChannels.MovieOrTvShow,
      id,
      queryType,
    ) as Promise<MovieDetails | TvShowDetails>;
  },
});

contextBridge.exposeInMainWorld("fileManagerAPI", {
  convertSrtToVtt: (path: string) => {
    return ipcRenderer.invoke(
      FileIPCChannels.CONVERT_SRT_TO_VTT,
      path,
    ) as Promise<string>;
  },
  deleteFile: (path: string) => {
    return ipcRenderer.invoke(FileIPCChannels.DELETE, path) as Promise<{
      success: boolean;
      message: string;
    }>;
  },
  fileExists: (path: string) => {
    return ipcRenderer.invoke(FileIPCChannels.FILE_EXISTS, path) as Promise<{
      exists: boolean;
    }>;
  },
  adjustSubtitleTiming: (args: {
    vttFilePath: string;
    adjustmentMs: number;
    increase?: boolean;
  }) => {
    return ipcRenderer.invoke(
      FileIPCChannels.ADJUST_SUBTITLE_TIMING,
      args,
    ) as Promise<string>;
  },
});

contextBridge.exposeInMainWorld("translationAPI", {
  translateSubtitles: (args: {
    vttFilePath: string;
    targetLanguage: string;
    sourceLanguage?: string;
    libretranslateUrl?: string;
  }) => {
    return ipcRenderer.invoke(
      TranslationIPCChannels.TRANSLATE_SUBTITLES,
      args,
    ) as Promise<string>;
  },
  getSupportedLanguages: (libretranslateUrl?: string) => {
    return ipcRenderer.invoke(
      TranslationIPCChannels.GET_SUPPORTED_LANGUAGES,
      libretranslateUrl,
    ) as Promise<Array<{ code: string; name: string }>>;
  },
  detectLanguage: (args: {
    text: string;
    libretranslateUrl?: string;
  }) => {
    return ipcRenderer.invoke(
      TranslationIPCChannels.DETECT_LANGUAGE,
      args,
    ) as Promise<string>;
  },
});

contextBridge.exposeInMainWorld("playlistAPI", {
  getPlaylist: (id: string): Promise<PlaylistModel | null> => {
    return ipcRenderer.invoke(PlaylistIPCChannels.GET_PLAYLIST, id);
  },
  getAllPlaylists: (): Promise<PlaylistModel[]> => {
    return ipcRenderer.invoke(PlaylistIPCChannels.GET_ALL_PLAYLISTS);
  },
  putPlaylist: (id: string, playlist: PlaylistModel): Promise<boolean> => {
    return ipcRenderer.invoke(PlaylistIPCChannels.PUT_PLAYLIST, id, playlist);
  },
  deletePlaylist: (id: string): Promise<boolean> => {
    return ipcRenderer.invoke(PlaylistIPCChannels.DELETE_PLAYLIST, id);
  },
});

contextBridge.exposeInMainWorld("youtubeAPI", {
  getVideoInfo: (url: string) => {
    return ipcRenderer.invoke(YoutubeIPCChannels.GetVideoInfo, url);
  },
  downloadVideo: (url: string, destinationPath: string) => {
    return ipcRenderer.invoke(
      YoutubeIPCChannels.DownloadVideo,
      url,
      destinationPath,
    );
  },
  addToDownloadQueue: (queueItem: {
    title: string;
    url: string;
    destinationPath: string;
    poster: string;
    backdrop: string;
  }) => {
    return ipcRenderer.invoke(YoutubeIPCChannels.AddToDownloadQueue, queueItem);
  },
  removeFromQueue: (id: string) =>
    ipcRenderer.invoke(YoutubeIPCChannels.RemoveFromQueue, id),
  isProcessingQueue: () =>
    ipcRenderer.invoke(YoutubeIPCChannels.IsProcessingQueue),
  clearQueue: () => ipcRenderer.invoke(YoutubeIPCChannels.ClearQueue),
  getQueue: () => ipcRenderer.invoke(YoutubeIPCChannels.GetQueue),
  swapQueueItems: (id1: string, id2: string) =>
    ipcRenderer.invoke(YoutubeIPCChannels.SwapQueueItems, id1, id2),
  processQueue: () => ipcRenderer.invoke(YoutubeIPCChannels.ProcessQueue),
  setIsProcessing: (isProcessing: boolean) =>
    ipcRenderer.invoke(YoutubeIPCChannels.SetIsProcessing, isProcessing),
  setProgressIntervalMs: (ms: number) =>
    ipcRenderer.invoke(YoutubeIPCChannels.SetProgressIntervalMs, ms),
  getProgressIntervalMs: () =>
    ipcRenderer.invoke(YoutubeIPCChannels.GetProgressIntervalMs),
});

contextBridge.exposeInMainWorld("mp4ConversionAPI", {
  addToConversionQueue: (inputPath: string) => {
    return ipcRenderer.invoke(
      Mp4ConversionIPCChannels.AddToConversionQueue,
      inputPath,
    );
  },
  addToConversionQueueBulk: (inputPaths: string[]) => {
    return ipcRenderer.invoke(
      Mp4ConversionIPCChannels.AddToConversionQueueBulk,
      inputPaths,
    );
  },
  pauseConversionItem: (id: string) => {
    return ipcRenderer.invoke(Mp4ConversionIPCChannels.PauseConversionItem, id);
  },
  unpauseConversionItem: (id: string) => {
    return ipcRenderer.invoke(
      Mp4ConversionIPCChannels.UnpauseConversionItem,
      id,
    );
  },
  isItemPaused: (id: string) => {
    return ipcRenderer.invoke(Mp4ConversionIPCChannels.IsItemPaused, id);
  },
  getCurrentProcessingItem: () => {
    return ipcRenderer.invoke(
      Mp4ConversionIPCChannels.GetCurrentProcessingItem,
    );
  },
  getConversionQueue: () => {
    return ipcRenderer.invoke(Mp4ConversionIPCChannels.GetConversionQueue);
  },
  removeFromConversionQueue: (id: string) => {
    return ipcRenderer.invoke(
      Mp4ConversionIPCChannels.RemoveFromConversionQueue,
      id,
    );
  },
  initializeConversionQueue: () => {
    return ipcRenderer.invoke(
      Mp4ConversionIPCChannels.InitializeConversionQueue,
    );
  },
  swapQueueItems: (id1: string, id2: string) => {
    return ipcRenderer.invoke(
      Mp4ConversionIPCChannels.SwapQueueItems,
      id1,
      id2,
    );
  },
});

contextBridge.exposeInMainWorld("llmAPI", {
  generateLlmResponse: (prompt: string, model?: string) => {
    return ipcRenderer.invoke(
      LlmIPCChannels.GENERATE_LLM_RESPONSE,
      prompt,
      model,
    );
  },
  generateLlmResponseByChunks: (
    socketId: string,
    event: string,
    prompt: string,
    responseReceiver: "desktop" | "mobile" = "mobile",
    model?: string,
  ) => {
    return ipcRenderer.invoke(
      LlmIPCChannels.GENERATE_LLM_RESPONSE_BY_CHUNKS,
      socketId,
      event,
      prompt,
      responseReceiver,
      model,
    );
  },
  cancelLlmStreamById: (streamId: string) => {
    return ipcRenderer.invoke(
      LlmIPCChannels.CANCEL_LLM_STREAM_BY_ID,
      streamId,
    );
  },
  cancelAllLlmStreams: () => {
    return ipcRenderer.invoke(
      LlmIPCChannels.CANCEL_ALL_LLM_STREAMS,
    );
  },
  getActiveLlmStreams: () => {
    return ipcRenderer.invoke(
      LlmIPCChannels.GET_ACTIVE_LLM_STREAMS,
    );
  },
  getAvailableModels: () => {
    return ipcRenderer.invoke(LlmIPCChannels.GET_AVAILABLE_MODELS);
  },
  pingOllamaServer: (model?: string) => {
    return ipcRenderer.invoke(LlmIPCChannels.PING_OLLAMA_SERVER, model);
  },
});

contextBridge.exposeInMainWorld("subtitleAPI", {
  // Legacy functions for backward compatibility
  generateSubtitles: (request: SubtitleGenerationRequest): Promise<SubtitleGenerationResponse> => {
    return ipcRenderer.invoke(SubtitleIPCChannels.GenerateSubtitles, request);
  },
  checkSubtitleStatus: (jobId: string): Promise<SubtitleGeneration | null> => {
    return ipcRenderer.invoke(SubtitleIPCChannels.CheckSubtitleStatus, jobId);
  },
  getExistingSubtitles: (videoPath: string): Promise<string[]> => {
    return ipcRenderer.invoke(SubtitleIPCChannels.GetExistingSubtitles, videoPath);
  },

  // New queue management functions
  addToSubtitleGenerationQueue: (
    inputPath: string,
    language?: string,
    format?: string,
    model?: string
  ) => {
    return ipcRenderer.invoke(
      SubtitleIPCChannels.AddToSubtitleGenerationQueue,
      inputPath,
      language,
      format,
      model
    );
  },
  addToSubtitleGenerationQueueBulk: (
    inputPaths: string[],
    language?: string,
    format?: string,
    model?: string
  ) => {
    return ipcRenderer.invoke(
      SubtitleIPCChannels.AddToSubtitleGenerationQueueBulk,
      inputPaths,
      language,
      format,
      model
    );
  },
  pauseSubtitleGenerationItem: (id: string) => {
    return ipcRenderer.invoke(SubtitleIPCChannels.PauseSubtitleGenerationItem, id);
  },
  unpauseSubtitleGenerationItem: (id: string) => {
    return ipcRenderer.invoke(SubtitleIPCChannels.UnpauseSubtitleGenerationItem, id);
  },
  isSubtitleItemPaused: (id: string) => {
    return ipcRenderer.invoke(SubtitleIPCChannels.IsSubtitleItemPaused, id);
  },
  getCurrentProcessingSubtitleItem: () => {
    return ipcRenderer.invoke(SubtitleIPCChannels.GetCurrentProcessingSubtitleItem);
  },
  getSubtitleGenerationQueue: () => {
    return ipcRenderer.invoke(SubtitleIPCChannels.GetSubtitleGenerationQueue);
  },
  removeFromSubtitleGenerationQueue: (id: string) => {
    return ipcRenderer.invoke(SubtitleIPCChannels.RemoveFromSubtitleGenerationQueue, id);
  },
  initializeSubtitleGenerationQueue: () => {
    return ipcRenderer.invoke(SubtitleIPCChannels.InitializeSubtitleGenerationQueue);
  },
  swapSubtitleQueueItems: (id1: string, id2: string) => {
    return ipcRenderer.invoke(SubtitleIPCChannels.SwapSubtitleQueueItems, id1, id2);
  },
});

contextBridge.exposeInMainWorld("subtitleSyncAPI", {
  addToSyncQueue: (
    videoPath: string, 
    subtitlePath: string, 
    options?: { splitPenalty?: number; noSplits?: boolean }
  ) => {
    return ipcRenderer.invoke(
      SubtitleSyncIPCChannels.AddToSyncQueue,
      videoPath,
      subtitlePath,
      options,
    );
  },
  addToSyncQueueBulk: (
    items: Array<{
      videoPath: string;
      subtitlePath: string;
      options?: { splitPenalty?: number; noSplits?: boolean };
    }>
  ) => {
    return ipcRenderer.invoke(
      SubtitleSyncIPCChannels.AddToSyncQueueBulk,
      items,
    );
  },
  pauseSyncItem: (id: string) => {
    return ipcRenderer.invoke(SubtitleSyncIPCChannels.PauseSyncItem, id);
  },
  unpauseSyncItem: (id: string) => {
    return ipcRenderer.invoke(SubtitleSyncIPCChannels.UnpauseSyncItem, id);
  },
  isItemPaused: (id: string) => {
    return ipcRenderer.invoke(SubtitleSyncIPCChannels.IsItemPaused, id);
  },
  getCurrentProcessingItem: () => {
    return ipcRenderer.invoke(SubtitleSyncIPCChannels.GetCurrentProcessingItem);
  },
  getSyncQueue: () => {
    return ipcRenderer.invoke(SubtitleSyncIPCChannels.GetSyncQueue);
  },
  removeFromSyncQueue: (id: string) => {
    return ipcRenderer.invoke(SubtitleSyncIPCChannels.RemoveFromSyncQueue, id);
  },
  initializeSyncQueue: () => {
    return ipcRenderer.invoke(SubtitleSyncIPCChannels.InitializeSyncQueue);
  },
  swapQueueItems: (id1: string, id2: string) => {
    return ipcRenderer.invoke(SubtitleSyncIPCChannels.SwapQueueItems, id1, id2);
  },
});

contextBridge.exposeInMainWorld("languageLearningAPI", {
  // Send messages to main process
  sendMessage: (channel: string, data?: any) => {
    ipcRenderer.send(channel, data);
  },
  
  // Listen for events from main process
  on: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.on(channel, callback);
  },
  
  // Remove listeners
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  },

  // Exercise database methods
  saveExercise: (exerciseData: any) => {
    return ipcRenderer.invoke(LanguageLearningIPCChannels.SAVE_EXERCISE, exerciseData);
  },

  getExercise: (key: string) => {
    return ipcRenderer.invoke(LanguageLearningIPCChannels.GET_EXERCISE, key);
  },

  getExercisesByVideo: (videoFilePath: string) => {
    return ipcRenderer.invoke(LanguageLearningIPCChannels.GET_EXERCISES_BY_VIDEO, videoFilePath);
  },

  getAllExercises: () => {
    return ipcRenderer.invoke(LanguageLearningIPCChannels.GET_ALL_EXERCISES);
  },

  deleteExercise: (key: string) => {
    return ipcRenderer.invoke(LanguageLearningIPCChannels.DELETE_EXERCISE, key);
  },

  updateExercise: (key: string, exerciseData: any) => {
    return ipcRenderer.invoke(LanguageLearningIPCChannels.UPDATE_EXERCISE, key, exerciseData);
  },

  updateExerciseStats: (key: string, isCorrect: boolean) => {
    return ipcRenderer.invoke(LanguageLearningIPCChannels.UPDATE_EXERCISE_STATS, key, isCorrect);
  },
});
