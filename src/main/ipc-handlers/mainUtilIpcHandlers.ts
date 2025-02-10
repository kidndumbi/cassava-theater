import { ipcMain, app } from "electron";
import { MainUtilIPCChannels } from "../../enums/main-util-IPC-channels";

export const mainUtilIpcHandlers = () => {
  ipcMain.handle(MainUtilIPCChannels.IS_PACKAGED, () => app.isPackaged);
};
