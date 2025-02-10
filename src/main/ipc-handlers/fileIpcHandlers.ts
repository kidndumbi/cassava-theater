import { ipcMain } from "electron";
import { convertSrtToVtt } from "../services/file.service";
import { FileIPCChannels } from "../../enums/fileIPCChannels";

export const fileIpcHandlers = () => {
  ipcMain.handle(
    FileIPCChannels.CONVERT_SRT_TO_VTT,
    async (_event: Electron.IpcMainInvokeEvent, path: string) => {
      return convertSrtToVtt(path);
    }
  );
};
