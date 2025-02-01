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
}

export interface MainNotificationsAPI {
  userConnected: (callback: (userId: string) => void) => void;
  userDisconnected: (callback: (userId: string) => void) => void;
}

export interface MainUtilAPI {
  isPackaged: () => Promise<boolean>;
}

export interface VideoAPI {
  fetchVideoData: (args: {
    filePath: string;
    searchText?: string;
    includeThumbnail: boolean;
  }) => Promise<any>;
  fetchVideoDetails: (args: { path: string }) => Promise<any>;
  fetchFolderDetails: (args: { path: string }) => Promise<any>;
  saveLastWatch: (args: {
    currentVideo: VideoDataModel;
    lastWatched: number;
    isEpisode?: boolean;
  }) => Promise<any>;
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
  }
}
