import { OpenDialogIpcChannels } from "./../enums/open-dialog-IPC-channels.enum";
import { ipcMain } from "electron";
import { SettingsIpcChannels } from "../enums/settings-IPC-channels.enum";
import { getAllValues, getValue, setValue } from "./store";
import { SettingsModel } from "../models/settings.model";
import { app } from "electron";
import {
  openFileDialog,
  openFolderDialog,
} from "./services/openDialog.service";
import { VideoIPCChannels } from "../enums/VideoIPCChannels";
import {
  fetchFolderDetails,
  fetchVideoDetails,
  fetchVideosData,
  saveLastWatch,
} from "./services/video.service";
import { MainUtilIPCChannels } from "../enums/main-util-IPC-channels";

export function registerIpcHandlers() {
  ipcMain.handle(
    SettingsIpcChannels.GET_ALL_SETTINGS,
    (_event: any, settingsName: string) => getAllValues()
  );

  ipcMain.handle(
    SettingsIpcChannels.GET_SETTING,
    (_event: any, key: keyof SettingsModel) => {
      return getValue(key);
    }
  );

  ipcMain.handle(
    SettingsIpcChannels.SET_SETTING,
    (_event: any, key: keyof SettingsModel, value: any) => {
      return setValue(key, value);
    }
  );

  ipcMain.handle(
    VideoIPCChannels.FetchVideoData,
    (
      _event: any,
      args: {
        filePath: string;
        searchText: string | undefined;
        includeThumbnail: boolean;
      }
    ) => {
      return fetchVideosData(args);
    }
  );

  ipcMain.handle(
    VideoIPCChannels.FetchVideoDetails,
    (_event: any, args: { path: string }) => {
      return fetchVideoDetails(args.path);
    }
  );

  ipcMain.handle(
    VideoIPCChannels.FetchFolderDetails,
    (_event: any, args: { path: string }) => {
      return fetchFolderDetails(args.path.replace("/", "\\"));
    }
  );

  ipcMain.handle(VideoIPCChannels.SaveLastWatch, saveLastWatch);

  ipcMain.handle(OpenDialogIpcChannels.OPEN_FOLDER_DIALOG, openFolderDialog);
  ipcMain.handle(OpenDialogIpcChannels.OPEN_FILE_DIALOG, openFileDialog);

  ipcMain.handle(MainUtilIPCChannels.IS_PACKAGED, () => app.isPackaged);
}
