import { SettingsModel } from "./main/store";
import { VideoCommands } from "./models/video-commands.model";
import { VideoDataModel } from "./models/videoData.model";
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
}

export interface MainNotificationsAPI {
  userConnected: (callback: (userId: string) => void) => void;
  userDisconnected: (callback: (userId: string) => void) => void;
  mp4ConversionProgress: (
    callback: (progress: { file: string; percent: number }) => void,
  ) => void;
}

export interface MainUtilAPI {
  isPackaged: () => Promise<boolean>;
  restart: () => void;
}

export interface VideoAPI {
  fetchVideoData: (args: {
    filePath: string;
    searchText?: string;
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
  }) => Promise<saveVideoJsonData>;
  AddTvShowFolder: (args: {
    tvShowName: string;
    subfolders: string[];
    tvShowDetails: TvShowDetails | null;
    tvShowsFolderPath: string;
  }) => Promise<VideoDataModel>;
  convertToMp4: (inputPath: string) => Promise<void>;
}

export interface TheMovieDbAPI {
  search: (
    query: string,
    queryType: "movie" | "tv",
    authorization: string,
  ) => Promise<MovieDetails[] | TvShowDetails[]>;
  movieOrTvShow: (
    id: string,
    queryType: "movie" | "tv",
    authorization: string,
  ) => Promise<MovieDetails | TvShowDetails>;
}

export interface FileManagerAPI {
  convertSrtToVtt: (path: string) => Promise<string>;
  deleteFile: (path: string) => Promise<{ success: boolean; message: string }>;
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
  }
}
