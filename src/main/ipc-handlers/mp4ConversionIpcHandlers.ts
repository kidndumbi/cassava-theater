import { ipcMain } from "electron";
import { Mp4ConversionIPCChannels } from "../../enums/mp4ConversionIPCChannels.enum";
import {
  addToConversionQueue,
  addToConversionQueueBulk,
  pauseConversionItem,
  unpauseConversionItem,
  isItemPaused,
  getCurrentProcessingItem,
  getConversionQueue,
  removeFromConversionQueue,
  initializeConversionQueue,
} from "../services/mp4Conversion.service";

export const mp4ConversionIpcHandlers = () => {
  ipcMain.handle(
    Mp4ConversionIPCChannels.AddToConversionQueue,
    async (_event: Electron.IpcMainInvokeEvent, inputPath: string) => {
      return addToConversionQueue(inputPath);
    },
  );
  ipcMain.handle(
    Mp4ConversionIPCChannels.AddToConversionQueueBulk,
    async (_event: Electron.IpcMainInvokeEvent, inputPaths: string[]) => {
      return addToConversionQueueBulk(inputPaths);
    },
  );
  ipcMain.handle(
    Mp4ConversionIPCChannels.PauseConversionItem,
    async (_event: Electron.IpcMainInvokeEvent, id: string) => {
      return pauseConversionItem(id);
    },
  );
  ipcMain.handle(
    Mp4ConversionIPCChannels.UnpauseConversionItem,
    async (_event: Electron.IpcMainInvokeEvent, id: string) => {
      return unpauseConversionItem(id);
    },
  );
  ipcMain.handle(
    Mp4ConversionIPCChannels.IsItemPaused,
    async (_event: Electron.IpcMainInvokeEvent, id: string) => {
      return isItemPaused(id);
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
      return await getConversionQueue();
    },
  );
  ipcMain.handle(
    Mp4ConversionIPCChannels.RemoveFromConversionQueue,
    async (_event: Electron.IpcMainInvokeEvent, id: string) => {
      return removeFromConversionQueue(id);
    },
  );
  ipcMain.handle(
    Mp4ConversionIPCChannels.InitializeConversionQueue,
    async () => {
      initializeConversionQueue();
      return true;
    },
  );
};
