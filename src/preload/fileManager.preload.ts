import { contextBridge, ipcRenderer } from "electron";
import { FileIPCChannels } from "../enums/fileIPCChannels";

export function exposeFileManagerApi() {
  contextBridge.exposeInMainWorld("fileManagerAPI", {
    convertSrtToVtt: (path: string) =>
      ipcRenderer.invoke(FileIPCChannels.CONVERT_SRT_TO_VTT, path) as Promise<string>,
    deleteFile: (path: string) =>
      ipcRenderer.invoke(FileIPCChannels.DELETE, path) as Promise<{ success: boolean; message: string }>,
    fileExists: (path: string) =>
      ipcRenderer.invoke(FileIPCChannels.FILE_EXISTS, path) as Promise<{ exists: boolean }>,
    adjustSubtitleTiming: (args: { vttFilePath: string; adjustmentMs: number; increase?: boolean }) =>
      ipcRenderer.invoke(FileIPCChannels.ADJUST_SUBTITLE_TIMING, args) as Promise<string>,
  });
}