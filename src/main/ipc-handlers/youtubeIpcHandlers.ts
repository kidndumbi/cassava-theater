import { ipcMain } from "electron";
import { YoutubeIPCChannels } from "../../enums/youtubeIPCChannels.enum";
import {
  getYoutubeVideoInfo,
  downloadYoutubeVideo,
  getYoutubeDownloadQueueInstance,
} from "../services/youtube.service";

export const youtubeIpcHandlers = () => {
  ipcMain.handle(
    YoutubeIPCChannels.GetVideoInfo,
    async (_event, url: string) => {
      console.log("Fetching YouTube video info for URL:", url);
      return getYoutubeVideoInfo(url);
    },
  );

  ipcMain.handle(
    YoutubeIPCChannels.DownloadVideo,
    async (_event, url: string, destinationPath: string) => {
      await downloadYoutubeVideo(url, destinationPath);
      return { success: true };
    },
  );

  ipcMain.handle(
    YoutubeIPCChannels.AddToDownloadQueue,
    async (
      _event,
      queueItem: { title: string; url: string; destinationPath: string },
    ) => {
      //addToYoutubeDownloadQueue(queueItem);
      getYoutubeDownloadQueueInstance().addToQueue(queueItem);
      return { success: true };
    },
  );

  ipcMain.handle(
    YoutubeIPCChannels.RemoveFromQueue,
    async (_event, id: string) => {
      getYoutubeDownloadQueueInstance().removeFromQueue(id);
      return { success: true };
    },
  );

  ipcMain.handle(
    YoutubeIPCChannels.IsProcessingQueue,
    async () => {
      return getYoutubeDownloadQueueInstance().isProcessingQueue();
    },
  );

  ipcMain.handle(
    YoutubeIPCChannels.ClearQueue,
    async () => {
      getYoutubeDownloadQueueInstance().clearQueue();
      return { success: true };
    },
  );

  ipcMain.handle(
    YoutubeIPCChannels.GetQueue,
    async () => {
      return getYoutubeDownloadQueueInstance().getQueue();
    },
  );
};
