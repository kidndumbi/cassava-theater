import { BrowserWindow } from "electron";
import { Socket } from "socket.io";
import { AppSocketEvents } from "../../../enums/app-socket-events.enum";
import * as mp4ConversionSvs from "../mp4Conversion.service";

export function registerMp4ConversionHandlers(
  socket: Socket,
  mainWindow: BrowserWindow,
) {
  socket.on(AppSocketEvents.MP4_CONVERSION_REMOVE_FROM_QUEUE, (id: string) => {
    const { success, queue } = mp4ConversionSvs.removeFromConversionQueue(id);

    if (success) {
      mainWindow.webContents.send("mp4-conversion-update-from-backend", {
        queue,
      });
    }
  });
}
