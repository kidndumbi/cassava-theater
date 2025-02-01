import { ipcMain } from "electron";
import { MainUtilIPCChannels } from "../../enums/main-util-IPC-channels";
import { app } from "electron";


export const mainUtilIpcHandlers = () => {
  ipcMain.handle(MainUtilIPCChannels.IS_PACKAGED, () => app.isPackaged);
};
