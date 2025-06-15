import { AppSocketEvents } from "../../../enums/app-socket-events.enum";
import { SettingsModel } from "../../../models/settings.model";
import * as settingsDataDbService from "../settingsDataDb.service";
import { loggingService as log } from "../main-logging.service";
import { Socket } from "socket.io";

export function registerSettingsHandlers(socket: Socket) {
  socket.on(
    AppSocketEvents.GET_SETTINGS,
    async (
      _event: Electron.IpcMainInvokeEvent,
      callback: (response: {
        success: boolean;
        data?: SettingsModel;
        error?: string;
      }) => void,
    ) => {
      try {
        const settings = await settingsDataDbService.getAllSettings();
        callback({ success: true, data: settings });
      } catch (error) {
        log.error("Error fetching videos data:", error);
        callback({ success: false, error: "Failed to fetch videos data" });
      }
    },
  );
}
