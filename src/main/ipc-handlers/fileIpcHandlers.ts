import { ipcMain } from "electron";
import { convertSrtToVtt, deleteFile } from "../services/file.service";
import { FileIPCChannels } from "../../enums/fileIPCChannels";
import * as fsPromises from "fs/promises";

export const fileIpcHandlers = () => {
  ipcMain.handle(
    FileIPCChannels.CONVERT_SRT_TO_VTT,
    async (_event: Electron.IpcMainInvokeEvent, path: string) => {
      return convertSrtToVtt(path);
    }
  );

  ipcMain.handle(
    FileIPCChannels.DELETE,
    async (_event: Electron.IpcMainInvokeEvent, path: string) => {
      try {
        if (path) {
          return deleteFile(path);
        } else {
          throw new Error("File path is not provided.");
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          throw new Error(`Error deleting file: ${error.message}`);
        } else {
          throw new Error("Error deleting file: Unknown error");
        }
      }
    }
  );

  ipcMain.handle(
    FileIPCChannels.FILE_EXISTS,
    async (_event: Electron.IpcMainInvokeEvent, path: string) => {
      if (!path) {
        throw new Error("File path is not provided.");
      }
      try {
        await fsPromises.access(path);
        return { exists: true };
      } catch {
        return { exists: false };
      }
    }
  );
};
