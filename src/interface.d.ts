import { ConversionQueueItem } from "./main/services/mp4Conversion.service";
import { YoutubeDownloadQueueItem } from "./main/services/youtube.service";
import ytdl from "@distube/ytdl-core";
import { PlaylistModel } from "./models/playlist.model";
import { VideoCommands } from "./models/video-commands.model";
import { VideoDataModel } from "./models/videoData.model";
import { PlaylistPlayRequestModel } from "./models/playlistPlayRequest.model";
import { PlaylistCommands } from "./models/playlist-commands.model";
export interface IElectronAPI {
  desktop: boolean;
}

export interface settingsAPI {
  getALLSettings: () => Promise<SettingsModel>;
  getSetting: (
    key: keyof SettingsModel,
  ) => Promise<SettingsModel[keyof SettingsModel]>;
  setSetting: (
    key: keyof SettingsModel,
    value: SettingsModel[keyof SettingsModel],
  ) => Promise<SettingsModel[keyof SettingsModel]>;
}

export interface OpenDialogAPI {
  openFileDialog: (
    options: {
      name: string;
      extensions: string[];
    }[],
  ) => Promise<string | null>;
  openFolderDialog: () => Promise<string | null>;
}

export interface VideoCommandsAPI {
  videoCommand: (callback: (command: VideoCommands) => void) => void;
  setCurrentVideo: (callback: (data: setPlayingModel) => void) => void;
  setCurrentPlaylist: (
    callback: (data: PlaylistPlayRequestModel) => void,
  ) => void;
}

export interface MainNotificationsAPI {
  userConnected: (callback: (userId: string) => void) => void;
  userDisconnected: (callback: (userId: string) => void) => void;
  mp4ConversionProgress: (
    callback: (progress: { queue: ConversionQueueItem[] }) => void,
  ) => void;
  mp4ConversionUpdatedFromBackend: (
    callback: (progress: { queue: ConversionQueueItem[] }) => void,
  ) => void;
  mp4ConversionCompleted: (
    callback: (progress: {
      queueItem: ConversionQueueItem;
      queue: ConversionQueueItem[];
    }) => void,
  ) => void;
  youtubeDownloadProgress: (
    callback: (progress: { queue: YoutubeDownloadQueueItem[] }) => void,
  ) => void;

  youtubeDownloadCompleted: (
    callback: (data: {
      queue: YoutubeDownloadQueueItem[];
      completedItem: YoutubeDownloadQueueItem;
    }) => void,
  ) => void;
  youtubeDownloadStarted: (
    callback: (queue: YoutubeDownloadQueueItem[]) => void,
  ) => void;
  youtubeDownloadUpdatedFromBackend: (
    callback: (queue: YoutubeDownloadQueueItem[]) => void,
  ) => void;
}

export interface MainUtilAPI {
  isPackaged: () => Promise<boolean>;
  restart: () => void;
  openExternalLink: (url: string) => Promise<void>;
}

export interface VideoAPI {
  fetchVideoData: (args: {
    filePath: string;
    includeThumbnail: boolean;
    category: string;
  }) => Promise<VideoDataModel[]>;
  fetchVideoDetails: (args: {
    path: string;
    category: string;
  }) => Promise<VideoDataModel>;
  fetchFolderDetails: (args: { path: string }) => Promise<VideoDataModel>;
  saveVideoDbCurrentTime: (args: {
    currentVideo: VideoDataModel;
    currentTime: number;
    isEpisode?: boolean;
  }) => Promise<VideoDataModel>;
  getVideoJsonData: (currentVideo: VideoDataModel) => Promise<VideoDataModel>;
  saveVideoJsonData: (args: {
    currentVideo: VideoDataModel;
    newVideoJsonData: VideoDataModel;
  }) => Promise<{
    currentVideo: VideoDataModel;
    newVideoJsonData: VideoDataModel;
  }>;
  AddTvShowFolder: (args: {
    tvShowName: string;
    subfolders: string[];
    tvShowDetails: TvShowDetails | null;
    tvShowsFolderPath: string;
    poster: string;
    backdrop: string;
  }) => Promise<VideoDataModel>;
  getFolderFiles: (folderPath: string) => Promise<string[]>;
  getScreenshot: (videoData: VideoDataModel) => Promise<string>;
  fetchRecentlyWatchedVideosData: (args: {
    videoType: "movies" | "tvShows";
    limit?: number;
  }) => Promise<VideoDataModel[]>;
  fetchRecentlyWatchedCustomVideosData: (args: { limit?: number }) => Promise<
    {
      folder: {
        id: string;
        name: string;
        folderPath: string;
      };
      videos: VideoDataModel[];
    }[]
  >;
  fetchWatchlaterVideos: () => Promise<VideoDataModel[]>;
}

export interface TheMovieDbAPI {
  search: (
    query: string,
    queryType: "movie" | "tv",
  ) => Promise<MovieDetails[] | TvShowDetails[]>;
  movieOrTvShow: (
    id: string,
    queryType: "movie" | "tv",
  ) => Promise<MovieDetails | TvShowDetails>;
}

export interface FileManagerAPI {
  convertSrtToVtt: (path: string) => Promise<string>;
  deleteFile: (path: string) => Promise<{ success: boolean; message: string }>;
  fileExists: (path: string) => Promise<{ exists: boolean }>;
}

export interface Mp4ConversionAPI {
  addToConversionQueue: (inputPath: string) => Promise<{
    success: boolean;
    queue: ConversionQueueItem[];
  }>;
  addToConversionQueueBulk: (inputPaths: string[]) => Promise<{
    success: boolean;
    queue: ConversionQueueItem[];
  }>;
  pauseConversionItem: (id: string) => Promise<{
    success: boolean;
    queue: ConversionQueueItem[];
  }>;
  unpauseConversionItem: (id: string) => Promise<{
    success: boolean;
    queue: ConversionQueueItem[];
  }>;
  isItemPaused: (id: string) => Promise<boolean>;
  getCurrentProcessingItem: () => Promise<ConversionQueueItem>;
  getConversionQueue: () => Promise<ConversionQueueItem[]>;
  removeFromConversionQueue: (id: string) => Promise<{
    success: boolean;
    queue: ConversionQueueItem[];
  }>;
  initializeConversionQueue: () => Promise<boolean>;
}

export interface PlaylistAPI {
  getPlaylist: (id: string) => Promise<PlaylistModel | null>;
  getAllPlaylists: () => Promise<PlaylistModel[]>;
  putPlaylist: (id: string, playlist: PlaylistModel) => Promise<boolean>;
  deletePlaylist: (id: string) => Promise<boolean>;
}

export interface YoutubeAPI {
  getVideoInfo: (url: string) => Promise<ytdl.videoInfo>;
  downloadVideo: (
    url: string,
    destinationPath: string,
  ) => Promise<{ success: boolean }>;
  addToDownloadQueue: (queueItem: {
    title: string;
    url: string;
    destinationPath: string;
    poster: string;
    backdrop: string;
  }) => Promise<{ success: boolean }>;
  removeFromQueue: (id: string) => Promise<{
    success: boolean;
    queue: YoutubeDownloadQueueItem[];
  }>;
  isProcessingQueue: () => Promise<boolean>;
  clearQueue: () => Promise<{ success: boolean }>;
  getQueue: () => Promise<YoutubeDownloadQueueItem[]>;
  swapQueueItems: (
    id1: string,
    id2: string,
  ) => Promise<{ success: boolean; error?: string }>;
  processQueue: () => Promise<{ success: boolean }>;
  setIsProcessing: (isProcessing: boolean) => Promise<{ success: boolean }>;
  setProgressIntervalMs: (ms: number) => Promise<{ success: boolean }>;
  getProgressIntervalMs: () => Promise<{ success: boolean; ms: number }>;
}

export interface PlaylistCommandsAPI {
  playlistVideoCommand: (callback: (command: PlaylistCommands) => void) => void;
}

export interface CurrentlyPlayingAPI {
  setCurrentVideo: (video: VideoDataModel) => Promise<boolean>;
  setCurrentPlaylist: (args: {
    playlist: Partial<PlaylistModel | null>;
    shuffle?: boolean;
  }) => Promise<PlaylistModel>;
  setCurrentTime: (
    currentTime: number,
  ) => Promise<{ success: boolean; error?: string }>;
  getCurrentPlaylist: () => Promise<Partial<PlaylistModel> | null>;
  getPlaylistVideos: () => Promise<VideoDataModel[]>;
  getNextPlaylistVideo: () => Promise<VideoDataModel | null>;
  getPreviousPlaylistVideo: () => Promise<VideoDataModel | null>;
  getCurrentVideo: () => Promise<VideoDataModel | null>;
}

declare global {
  interface Window {
    myAPI: IElectronAPI;
    settingsAPI: settingsAPI;
    openDialogAPI: OpenDialogAPI;
    videoCommandsAPI: VideoCommandsAPI;
    mainNotificationsAPI: MainNotificationsAPI;
    videoAPI: VideoAPI;
    mainUtilAPI: MainUtilAPI;
    theMovieDbAPI: TheMovieDbAPI;
    fileManagerAPI: FileManagerAPI;
    mp4ConversionAPI: Mp4ConversionAPI;
    playlistAPI: PlaylistAPI;
    youtubeAPI: YoutubeAPI;
    playlistCommandsAPI: PlaylistCommandsAPI;
    currentlyPlayingAPI: CurrentlyPlayingAPI;
  }
}
