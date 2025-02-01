import { ipcMain } from "electron";
import { VideoIPCChannels } from "../../enums/VideoIPCChannels";
import {
  fetchFolderDetails,
  fetchVideoDetails,
  fetchVideosData,
  saveLastWatch,
} from "../services/video.service";

export const videosIpcHandlers = () => {
  ipcMain.handle(
    VideoIPCChannels.FetchVideoData,
    (
      _event: any,
      args: {
        filePath: string;
        searchText: string | undefined;
        includeThumbnail: boolean;
        category: string;
      }
    ) => {
      return fetchVideosData(args);
    }
  );

  ipcMain.handle(
    VideoIPCChannels.FetchVideoDetails,
    (_event: any, args: { path: string }) => {
      return fetchVideoDetails(args.path);
    }
  );

  ipcMain.handle(
    VideoIPCChannels.FetchFolderDetails,
    (_event: any, args: { path: string }) => {
      return fetchFolderDetails(args.path.replace("/", "\\"));
    }
  );

  ipcMain.handle(VideoIPCChannels.SaveLastWatch, saveLastWatch);
};
