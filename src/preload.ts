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

contextBridge.exposeInMainWorld("myAPI", {
  desktop: false,
});

contextBridge.exposeInMainWorld("mainUtilAPI", {
  isPackaged: () =>
    ipcRenderer.invoke(MainUtilIPCChannels.IS_PACKAGED) as Promise<boolean>,
  restart: () => ipcRenderer.send("restart-app"),
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
    return ipcRenderer.invoke(CurrentlyPlayingIPCChannels.SetCurrentVideo, video);
  },
  setCurrentPlaylist: (playlist: Partial<PlaylistModel>) => {
    return ipcRenderer.invoke(CurrentlyPlayingIPCChannels.SetCurrentPlaylist, playlist);
  },
  setCurrentTime: (currentTime: number) => {
    return ipcRenderer.invoke(CurrentlyPlayingIPCChannels.SET_CURRENTLY_PLAYING_CURRENTTIME, currentTime);
  }
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
    callback: (progress: { file: string; percent: number }) => void,
  ) => {
    ipcRenderer.on(
      "mp4-conversion-progress",
      (
        event: Electron.IpcRendererEvent,
        progress: { file: string; percent: number },
      ) => callback(progress),
    );
  },
  mp4ConversionCompleted: (
    callback: (progress: { file: string; percent: number }) => void,
  ) => {
    ipcRenderer.on(
      "mp4-conversion-completed",
      (
        event: Electron.IpcRendererEvent,
        progress: { file: string; percent: number },
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
    return ipcRenderer.invoke(FileIPCChannels.FILE_EXISTS, path) as Promise<{ exists: boolean }>;
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
  processQueue: () =>
    ipcRenderer.invoke(YoutubeIPCChannels.ProcessQueue),
  setIsProcessing: (isProcessing: boolean) =>
    ipcRenderer.invoke(YoutubeIPCChannels.SetIsProcessing, isProcessing),
});

contextBridge.exposeInMainWorld("mp4ConversionAPI", {
  addToConversionQueue: (inputPath: string) => {
    return ipcRenderer.invoke(
      Mp4ConversionIPCChannels.AddToConversionQueue,
      inputPath,
    );
  },
  pauseConversionItem: (inputPath: string) => {
    return ipcRenderer.invoke(
      Mp4ConversionIPCChannels.PauseConversionItem,
      inputPath,
    );
  },
  unpauseConversionItem: (inputPath: string) => {
    return ipcRenderer.invoke(
      Mp4ConversionIPCChannels.UnpauseConversionItem,
      inputPath,
    );
  },
  isItemPaused: (inputPath: string) => {
    return ipcRenderer.invoke(Mp4ConversionIPCChannels.IsItemPaused, inputPath);
  },
  getCurrentProcessingItem: () => {
    return ipcRenderer.invoke(
      Mp4ConversionIPCChannels.GetCurrentProcessingItem,
    );
  },
  getConversionQueue: () => {
    return ipcRenderer.invoke(Mp4ConversionIPCChannels.GetConversionQueue);
  },
  removeFromConversionQueue: (inputPath: string) => {
    return ipcRenderer.invoke(
      Mp4ConversionIPCChannels.RemoveFromConversionQueue,
      inputPath,
    );
  },
  initializeConversionQueue: () => {
    return ipcRenderer.invoke(
      Mp4ConversionIPCChannels.InitializeConversionQueue,
    );
  },
});
