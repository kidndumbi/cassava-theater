import { contextBridge, ipcRenderer } from "electron";
import { SettingsIpcChannels } from "../enums/settings-IPC-channels.enum";
import { SettingsModel } from "../models/settings.model";

export function exposeSettingsApi() {
  contextBridge.exposeInMainWorld("settingsAPI", {
    getALLSettings: () =>
      ipcRenderer.invoke(SettingsIpcChannels.GET_ALL_SETTINGS) as Promise<SettingsModel>,
    getSetting: (key: keyof SettingsModel) =>
      ipcRenderer.invoke(SettingsIpcChannels.GET_SETTING, key) as Promise<SettingsModel[keyof SettingsModel]>,
    setSetting: (key: keyof SettingsModel, value: SettingsModel[keyof SettingsModel]) =>
      ipcRenderer.invoke(SettingsIpcChannels.SET_SETTING, key, value) as Promise<SettingsModel[keyof SettingsModel]>,
  });
}