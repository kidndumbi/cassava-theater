import { ipcMain, app, shell } from "electron";
import { MainUtilIPCChannels } from "../../enums/main-util-IPC-channels";

export const mainUtilIpcHandlers = () => {
  ipcMain.handle(MainUtilIPCChannels.IS_PACKAGED, () => app.isPackaged);
  ipcMain.handle(MainUtilIPCChannels.OPEN_EXTERNAL_LINK, async (_event, url: string) => {
    await shell.openExternal(url);
  });
};
