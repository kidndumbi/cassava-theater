import { ipcMain } from "electron";
import { YoutubeIPCChannels } from "../../enums/youtubeIPCChannels.enum";
import { getYoutubeVideoInfo, downloadYoutubeVideo } from "../services/youtube.service";

export const youtubeIpcHandlers = () => {
  ipcMain.handle(
    YoutubeIPCChannels.GetVideoInfo,
    async (_event, url: string) => {
        console.log("Fetching YouTube video info for URL:", url);
      return getYoutubeVideoInfo(url);
    }
  );

  ipcMain.handle(
    YoutubeIPCChannels.DownloadVideo,
    async (_event, url: string, destinationPath: string) => {
      await downloadYoutubeVideo(url, destinationPath);
      return { success: true };
    }
  );
};
