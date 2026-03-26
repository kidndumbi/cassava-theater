import { BrowserWindow } from "electron";
import { Socket } from "socket.io";
import { AppSocketEvents } from "../../../enums/app-socket-events.enum";
import * as subtitleGenerationSvs from "../subtitle.service";

export function registerSubtitleGenerationHandlers(
  socket: Socket,
  mainWindow: BrowserWindow,
) {
  socket.on(AppSocketEvents.SUBTITLE_GENERATION_REMOVE_FROM_QUEUE, (id: string) => {
    const { success, queue } = subtitleGenerationSvs.removeFromSubtitleGenerationQueue(id);

    if (success) {
      mainWindow.webContents.send("subtitle-generation-update-from-backend", {
        queue,
      });
    }
  });
}