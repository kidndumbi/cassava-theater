import { ipcMain } from "electron";
import { convertSrtToVtt, deleteFile, adjustSubtitleTiming } from "../services/file.service";
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

  ipcMain.handle(
    FileIPCChannels.ADJUST_SUBTITLE_TIMING,
    async (_event: Electron.IpcMainInvokeEvent, args: {
      vttFilePath: string;
      adjustmentMs: number;
      increase?: boolean;
    }) => {
      try {
        const { vttFilePath, adjustmentMs, increase = true } = args;
        if (!vttFilePath) {
          throw new Error("VTT file path is not provided.");
        }
        if (adjustmentMs === undefined || adjustmentMs === null) {
          throw new Error("Adjustment time in milliseconds is not provided.");
        }
        return adjustSubtitleTiming(vttFilePath, adjustmentMs, increase);
      } catch (error: unknown) {
        if (error instanceof Error) {
          throw new Error(`Error adjusting subtitle timing: ${error.message}`);
        } else {
          throw new Error("Error adjusting subtitle timing: Unknown error");
        }
      }
    }
  );
};
