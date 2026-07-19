import { ipcMain } from "electron";
import { convertSrtToVtt, deleteFile, adjustSubtitleTiming } from "../services/file.service";
import { FileIPCChannels } from "../../enums/fileIPCChannels";
import * as fsPromises from "fs/promises";

export const registerFileHandlers = {
  ipc(): void {
    ipcMain.handle(FileIPCChannels.CONVERT_SRT_TO_VTT, async (_event, path: string) => {
      return convertSrtToVtt(path);
    });

    ipcMain.handle(FileIPCChannels.DELETE, async (_event, path: string) => {
      if (!path) throw new Error("File path is not provided.");
      return deleteFile(path);
    });

    ipcMain.handle(FileIPCChannels.FILE_EXISTS, async (_event, path: string) => {
      if (!path) throw new Error("File path is not provided.");
      try {
        await fsPromises.access(path);
        return { exists: true };
      } catch {
        return { exists: false };
      }
    });

    ipcMain.handle(FileIPCChannels.ADJUST_SUBTITLE_TIMING, async (_event, args: {
      vttFilePath: string;
      adjustmentMs: number;
      increase?: boolean;
    }) => {
      const { vttFilePath, adjustmentMs, increase = true } = args;
      if (!vttFilePath) throw new Error("VTT file path is not provided.");
      if (adjustmentMs === undefined || adjustmentMs === null) throw new Error("Adjustment time is not provided.");
      return adjustSubtitleTiming(vttFilePath, adjustmentMs, increase);
    });
  },
  // No Socket.IO equivalent — desktop-only feature
};