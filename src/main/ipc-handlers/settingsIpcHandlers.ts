import { ipcMain } from "electron";
import { SettingsIpcChannels } from "../../enums/settings-IPC-channels.enum";
import * as settingsDataDbService from "../services/settingsDataDb.service";
import { SettingsModel } from "../../models/settings.model";

export const settingsIpcHandlers = () => {
  ipcMain.handle(
    SettingsIpcChannels.GET_ALL_SETTINGS,
    async () => await settingsDataDbService.getAllSettings(),
  );

  ipcMain.handle(
    SettingsIpcChannels.GET_SETTING,
    (_event: Electron.IpcMainInvokeEvent, key: keyof SettingsModel) => {
      return settingsDataDbService.getSetting(key);
    },
  );

  ipcMain.handle(
    SettingsIpcChannels.SET_SETTING,
    (
      _event: Electron.IpcMainInvokeEvent,
      key: keyof SettingsModel,
      value: SettingsModel[keyof SettingsModel],
    ) => {
      return settingsDataDbService.setSetting(key, value);
    },
  );
};
