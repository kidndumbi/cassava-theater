import { SettingsIpcChannels } from "./enums/settings-IPC-channels.enum";
// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";
import { SettingsModel } from "./models/settings.model";
import { OpenDialogIpcChannels } from "./enums/open-dialog-IPC-channels.enum";
import { VideoCommands } from "./models/video-commands.model";

contextBridge.exposeInMainWorld("myAPI", {
  desktop: false,
});

contextBridge.exposeInMainWorld("settingsAPI", {
  getALLSettings: () => {
    return ipcRenderer.invoke(
      SettingsIpcChannels.GET_ALL_SETTINGS
    ) as Promise<SettingsModel>;
  },
  getSetting: (key: keyof SettingsModel) => {
    return ipcRenderer.invoke(SettingsIpcChannels.GET_SETTING, key) as Promise<
      SettingsModel[keyof SettingsModel]
    >;
  },
  setSetting: (key: keyof SettingsModel, value: any) => {
    return ipcRenderer.invoke(
      SettingsIpcChannels.SET_SETTING,
      key,
      value
    ) as Promise<any>;
  },
});

contextBridge.exposeInMainWorld("openDialogAPI", {
  openFileDialog: (filters?: { name: string; extensions: string[] }[]) => {
    return ipcRenderer.invoke(
      OpenDialogIpcChannels.OPEN_FILE_DIALOG,
      filters
    ) as Promise<string | null>;
  },
  openFolderDialog: () => {
    return ipcRenderer.invoke(
      OpenDialogIpcChannels.OPEN_FOLDER_DIALOG
    ) as Promise<string | null>;
  },
});

contextBridge.exposeInMainWorld("videoCommandsAPI", {
  videoCommand: (callback: (command: VideoCommands) => void) => {
    ipcRenderer.on(
      "video-command",
      (event: Electron.IpcRendererEvent, command: VideoCommands) =>
        callback(command)
    );
  },
});

contextBridge.exposeInMainWorld("mainNotificationsAPI", {
  userConnected: (callback: (userId: string) => void) => {
    ipcRenderer.on(
      "user-connected",
      (event: Electron.IpcRendererEvent, userId: string) => callback(userId)
    );
  },
  userDisconnected: (callback: (userId: string) => void) => {
    ipcRenderer.on(
      "user-disconnected",
      (event: Electron.IpcRendererEvent, userId: string) => callback(userId)
    );
  },
});
