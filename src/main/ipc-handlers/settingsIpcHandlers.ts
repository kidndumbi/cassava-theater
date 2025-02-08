import { ipcMain } from "electron";
import { SettingsIpcChannels } from "../../enums/settings-IPC-channels.enum";
import { getAllValues, getValue, setValue } from "../store";
import { SettingsModel } from "../../models/settings.model";

export const settingsIpcHandlers = () => {
  ipcMain.handle(
    SettingsIpcChannels.GET_ALL_SETTINGS,
    () => getAllValues()
  );

  ipcMain.handle(
    SettingsIpcChannels.GET_SETTING,
    (_event: Electron.IpcMainInvokeEvent, key: keyof SettingsModel) => {
      return getValue(key);
    }
  );

  ipcMain.handle(
    SettingsIpcChannels.SET_SETTING,
    (_event: Electron.IpcMainInvokeEvent, key: keyof SettingsModel, value: SettingsModel[keyof SettingsModel]) => {
      return setValue(key, value);
    }
  );
};
