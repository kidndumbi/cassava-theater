import { ipcMain, BrowserWindow } from "electron";
import { Socket } from "socket.io";
import ytdl from "@distube/ytdl-core";
import { YoutubeIPCChannels } from "../../enums/youtubeIPCChannels.enum";
import { AppSocketEvents } from "../../enums/app-socket-events.enum";
import { YoutubeDownloadQueueItem } from "../services/youtube.service";
import { getYoutubeVideoInfo, downloadYoutubeVideo, getYoutubeDownloadQueueInstance } from "../services/youtube.service";

export const registerYoutubeHandlers = {
  ipc(): void {
    ipcMain.handle(YoutubeIPCChannels.GetVideoInfo, async (_event, url: string) => getYoutubeVideoInfo(url));
    ipcMain.handle(YoutubeIPCChannels.DownloadVideo, async (_event, url: string, destinationPath: string) => { await downloadYoutubeVideo(url, destinationPath); return { success: true }; });
    ipcMain.handle(YoutubeIPCChannels.AddToDownloadQueue, async (_event, qi: { title: string; url: string; destinationPath: string; poster: string; backdrop: string }) => { getYoutubeDownloadQueueInstance().addToQueue(qi); return { success: true }; });
    ipcMain.handle(YoutubeIPCChannels.RemoveFromQueue, async (_event, id: string) => getYoutubeDownloadQueueInstance().removeFromQueue(id));
    ipcMain.handle(YoutubeIPCChannels.IsProcessingQueue, async () => getYoutubeDownloadQueueInstance().isProcessingQueue());
    ipcMain.handle(YoutubeIPCChannels.ClearQueue, async () => { getYoutubeDownloadQueueInstance().clearQueue(); return { success: true }; });
    ipcMain.handle(YoutubeIPCChannels.GetQueue, async () => getYoutubeDownloadQueueInstance().getQueue());
    ipcMain.handle(YoutubeIPCChannels.SwapQueueItems, async (_event, id1: string, id2: string) => { try { getYoutubeDownloadQueueInstance().swapQueueItems(id1, id2); return { success: true }; } catch (error) { return { success: false, error: (error as Error).message }; } });
    ipcMain.handle(YoutubeIPCChannels.ProcessQueue, async () => { await getYoutubeDownloadQueueInstance().processQueue(); return { success: true }; });
    ipcMain.handle(YoutubeIPCChannels.SetIsProcessing, async (_event, isProcessing: boolean) => { getYoutubeDownloadQueueInstance().setIsProcessing(isProcessing); return { success: true }; });
    ipcMain.handle(YoutubeIPCChannels.SetProgressIntervalMs, async (_event, ms: number) => { getYoutubeDownloadQueueInstance().setProgressIntervalMs(ms); return { success: true }; });
    ipcMain.handle(YoutubeIPCChannels.GetProgressIntervalMs, async () => { const ms = getYoutubeDownloadQueueInstance().getProgressIntervalMs(); return { success: true, ms }; });
  },

  socket(socket: Socket, mainWindow: BrowserWindow): void {
    socket.on(AppSocketEvents.YT_GET_VIDEO_INFO, async (requestData: { data: { url: string } }, callback: (r: { success: boolean; data?: ytdl.videoInfo; error?: string }) => void) => {
      try { const { url } = requestData.data; const data = await getYoutubeVideoInfo(url); callback({ success: true, data }); }
      catch (error) { callback({ success: false, error: (error as Error).message }); }
    });
    socket.on(AppSocketEvents.YT_DOWNLOAD_VIDEO, async (requestData: { data: { url: string; destinationPath: string } }, callback: (r: { success: boolean; error?: string }) => void) => {
      try { await downloadYoutubeVideo(requestData.data.url, requestData.data.destinationPath); callback({ success: true }); }
      catch (error) { callback({ success: false, error: (error as Error).message }); }
    });
    socket.on(AppSocketEvents.YT_ADD_TO_DOWNLOAD_QUEUE, async (requestData: { data: { title: string; url: string; destinationPath: string; poster: string; backdrop: string } }, callback: (r: { success: boolean; error?: string }) => void) => {
      try { getYoutubeDownloadQueueInstance().addToQueue(requestData.data); callback({ success: true }); }
      catch (error) { callback({ success: false, error: (error as Error).message }); }
    });
    socket.on(AppSocketEvents.YT_REMOVE_FROM_QUEUE, (id: string) => {
      const { success, queue } = getYoutubeDownloadQueueInstance().removeFromQueue(id);
      if (success) { mainWindow.webContents.send("youtube-download-update-from-backend", queue); }
    });
    socket.on(AppSocketEvents.YT_IS_PROCESSING_QUEUE, async (_req: unknown, callback: (r: { success: boolean; data?: boolean; error?: string }) => void) => {
      try { const data = getYoutubeDownloadQueueInstance().isProcessingQueue(); callback({ success: true, data }); }
      catch (error) { callback({ success: false, error: (error as Error).message }); }
    });
    socket.on(AppSocketEvents.YT_CLEAR_QUEUE, async (_req: unknown, callback: (r: { success: boolean; error?: string }) => void) => {
      try { getYoutubeDownloadQueueInstance().clearQueue(); callback({ success: true }); }
      catch (error) { callback({ success: false, error: (error as Error).message }); }
    });
    socket.on(AppSocketEvents.YT_GET_QUEUE, async (_req: unknown, callback: (r: { success: boolean; data?: YoutubeDownloadQueueItem[]; error?: string }) => void) => {
      try { const data = getYoutubeDownloadQueueInstance().getQueue(); callback({ success: true, data }); }
      catch (error) { callback({ success: false, error: (error as Error).message }); }
    });
    socket.on(AppSocketEvents.YT_SWAP_QUEUE_ITEMS, async (requestData: { data: { id1: string; id2: string } }, callback: (r: { success: boolean; error?: string }) => void) => {
      try { getYoutubeDownloadQueueInstance().swapQueueItems(requestData.data.id1, requestData.data.id2); callback({ success: true }); }
      catch (error) { callback({ success: false, error: (error as Error).message }); }
    });
  },
};