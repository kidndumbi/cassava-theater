import { BrowserWindow } from "electron";
import { Socket } from "socket.io";
import { AppSocketEvents } from "../../../enums/app-socket-events.enum";
import * as subtitleSyncSvs from "../subtitleSync.service";

export function registerSubtitleSyncHandlers(
  socket: Socket,
  mainWindow: BrowserWindow,
) {
  socket.on(AppSocketEvents.SUBTITLE_SYNC_REMOVE_FROM_QUEUE, (id: string) => {
    const { success, queue } = subtitleSyncSvs.removeFromSubtitleSyncQueue(id);

    if (success) {
      mainWindow.webContents.send("subtitle-sync-update-from-backend", {
        queue,
      });
    }
  });
}