import { ipcMain, BrowserWindow } from "electron";
import { Socket } from "socket.io";
import { Mp4ConversionIPCChannels } from "../../enums/mp4ConversionIPCChannels.enum";
import { AppSocketEvents } from "../../enums/app-socket-events.enum";
import {
  addToConversionQueue, addToConversionQueueBulk, pauseConversionItem,
  unpauseConversionItem, isItemPaused, getCurrentProcessingItem,
  getConversionQueue, removeFromConversionQueue, initializeConversionQueue,
  swapConversionQueueItems,
} from "../services/mp4Conversion.service";

export const registerMp4ConversionHandlers = {
  ipc(): void {
    ipcMain.handle(Mp4ConversionIPCChannels.AddToConversionQueue, async (_event, inputPath: string) => addToConversionQueue(inputPath));
    ipcMain.handle(Mp4ConversionIPCChannels.AddToConversionQueueBulk, async (_event, inputPaths: string[]) => addToConversionQueueBulk(inputPaths));
    ipcMain.handle(Mp4ConversionIPCChannels.PauseConversionItem, async (_event, id: string) => pauseConversionItem(id));
    ipcMain.handle(Mp4ConversionIPCChannels.UnpauseConversionItem, async (_event, id: string) => unpauseConversionItem(id));
    ipcMain.handle(Mp4ConversionIPCChannels.IsItemPaused, async (_event, id: string) => isItemPaused(id));
    ipcMain.handle(Mp4ConversionIPCChannels.GetCurrentProcessingItem, async () => getCurrentProcessingItem());
    ipcMain.handle(Mp4ConversionIPCChannels.GetConversionQueue, async () => await getConversionQueue());
    ipcMain.handle(Mp4ConversionIPCChannels.RemoveFromConversionQueue, async (_event, id: string) => removeFromConversionQueue(id));
    ipcMain.handle(Mp4ConversionIPCChannels.InitializeConversionQueue, async () => { initializeConversionQueue(); return true; });
    ipcMain.handle(Mp4ConversionIPCChannels.SwapQueueItems, async (_event, id1: string, id2: string) => swapConversionQueueItems(id1, id2));
  },

  socket(socket: Socket, mainWindow: BrowserWindow): void {
    socket.on(AppSocketEvents.MP4_CONVERSION_REMOVE_FROM_QUEUE, (id: string) => {
      const { success, queue } = removeFromConversionQueue(id);
      if (success) {
        mainWindow.webContents.send("mp4-conversion-update-from-backend", { queue });
      }
    });
  },
};