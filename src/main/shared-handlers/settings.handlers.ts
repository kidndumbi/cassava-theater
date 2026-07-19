import { ipcMain } from "electron";
import { Socket } from "socket.io";
import { SettingsIpcChannels } from "../../enums/settings-IPC-channels.enum";
import { AppSocketEvents } from "../../enums/app-socket-events.enum";
import { SettingsModel } from "../../models/settings.model";
import * as settingsDataDbService from "../services/settingsDataDb.service";
import { loggingService as log } from "../services/main-logging.service";

const ipcGetAllSettings = async () => await settingsDataDbService.getAllSettings();
const ipcGetSetting = (_event: Electron.IpcMainInvokeEvent, key: keyof SettingsModel) => settingsDataDbService.getSetting(key);
const ipcSetSetting = (_event: Electron.IpcMainInvokeEvent, key: keyof SettingsModel, value: SettingsModel[keyof SettingsModel]) =>
  settingsDataDbService.setSetting(key, value);

const socketGetSettings = async (socket: Socket) => {
  socket.on(AppSocketEvents.GET_SETTINGS, async (_event, callback: (r: { success: boolean; data?: SettingsModel; error?: string }) => void) => {
    try {
      const settings = await settingsDataDbService.getAllSettings();
      callback({ success: true, data: settings ?? undefined });
    } catch (error) {
      log.error("Error fetching settings:", error);
      callback({ success: false, error: "Failed to fetch settings" });
    }
  });
};

export const registerSettingsHandlers = {
  ipc(): void {
    ipcMain.handle(SettingsIpcChannels.GET_ALL_SETTINGS, ipcGetAllSettings);
    ipcMain.handle(SettingsIpcChannels.GET_SETTING, ipcGetSetting);
    ipcMain.handle(SettingsIpcChannels.SET_SETTING, ipcSetSetting);
  },
  socket(socket: Socket): void {
    socketGetSettings(socket);
  },
};