import { ipcMain } from "electron";
import { Mp4ConversionIPCChannels } from "../../enums/mp4ConversionIPCChannels.enum";
import {
  addToConversionQueue,
  pauseConversionItem,
  unpauseConversionItem,
  isItemPaused,
  getCurrentProcessingItem,
  getConversionQueue,
  removeFromConversionQueue,
} from "../services/mp4Conversion.service";

export const mp4ConversionIpcHandlers = () => {
  ipcMain.handle(
    Mp4ConversionIPCChannels.AddToConversionQueue,
    async (_event: Electron.IpcMainInvokeEvent, inputPath: string) => {
      return addToConversionQueue(inputPath);
    },
  );
  ipcMain.handle(
    Mp4ConversionIPCChannels.PauseConversionItem,
    async (_event: Electron.IpcMainInvokeEvent, inputPath: string) => {
      return pauseConversionItem(inputPath);
    },
  );
  ipcMain.handle(
    Mp4ConversionIPCChannels.UnpauseConversionItem,
    async (_event: Electron.IpcMainInvokeEvent, inputPath: string) => {
      return unpauseConversionItem(inputPath);
    },
  );
  ipcMain.handle(
    Mp4ConversionIPCChannels.IsItemPaused,
    async (_event: Electron.IpcMainInvokeEvent, inputPath: string) => {
      return isItemPaused(inputPath);
    },
  );
  ipcMain.handle(
    Mp4ConversionIPCChannels.GetCurrentProcessingItem,
    async () => {
      return getCurrentProcessingItem();
    },
  );
  ipcMain.handle(
    Mp4ConversionIPCChannels.GetConversionQueue,
    async () => {
      return getConversionQueue();
    },
  );
  ipcMain.handle(
    Mp4ConversionIPCChannels.RemoveFromConversionQueue,
    async (_event: Electron.IpcMainInvokeEvent, inputPath: string) => {
      return removeFromConversionQueue(inputPath);
    },
  );
};
