import { isPackaged } from "./interface.d";
import { SettingsModel } from "./main/store";
import { VideoCommands } from "./models/video-commands.model";
import { VideoDataModel } from "./models/videoData.model";
export interface IElectronAPI {
  desktop: boolean;
}

export interface settingsAPI {
  getALLSettings: () => Promise<SettingsModel>;
  getSetting: (
    key: keyof SettingsModel
  ) => Promise<SettingsModel[keyof SettingsModel]>;
  setSetting: (key: keyof SettingsModel, value: any) => Promise<any>;
}

export interface OpenDialogAPI {
  openFileDialog: (options: any) => Promise<string | null>;
  openFolderDialog: () => Promise<string | null>;
}

export interface VideoCommandsAPI {
  videoCommand: (callback: (command: VideoCommands) => void) => void;
  setCurrentVideo: (callback: (data: setPlayingModel) => void) => void;
}

export interface MainNotificationsAPI {
  userConnected: (callback: (userId: string) => void) => void;
  userDisconnected: (callback: (userId: string) => void) => void;
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
  }) => Promise<any>;
  fetchVideoDetails: (args: { path: string }) => Promise<any>;
  fetchFolderDetails: (args: { path: string }) => Promise<any>;
  saveLastWatch: (args: {
    currentVideo: VideoDataModel;
    lastWatched: number;
    isEpisode?: boolean;
  }) => Promise<any>;
  getVideoJsonData: (currentVideo: VideoDataModel) => Promise<any>;
  saveVideoJsonData: (args: {
    currentVideo: VideoDataModel;
    newVideoJsonData: VideoDataModel;
  }) => Promise<any>;
}

export interface TheMovieDbAPI {
  search: (query: string, queryType: "movie" | "tv") => Promise<any>;
  movieOrTvShow: (id: string, queryType: "movie" | "tv") => Promise<any>;
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
  }
}
