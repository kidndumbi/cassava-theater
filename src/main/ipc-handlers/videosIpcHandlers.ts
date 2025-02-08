import { ipcMain } from "electron";
import { VideoIPCChannels } from "../../enums/VideoIPCChannels";
import {
  fetchFolderDetails,
  fetchVideoDetails,
  fetchVideosData,
  getVideoJsonData,
  saveLastWatch,
  saveVideoJsonData,
} from "../services/video-data.service";

export const videosIpcHandlers = () => {
  ipcMain.handle(
    VideoIPCChannels.FetchVideoData,
    (
      _event: Electron.IpcMainInvokeEvent,
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
    (_event: Electron.IpcMainInvokeEvent, args: { path: string }) => {
      return fetchVideoDetails(args.path);
    }
  );

  ipcMain.handle(
    VideoIPCChannels.FetchFolderDetails,
    (_event: Electron.IpcMainInvokeEvent, args: { path: string }) => {
      return fetchFolderDetails(args.path.replace("/", "\\"));
    }
  );

  ipcMain.handle(VideoIPCChannels.SaveLastWatch, saveLastWatch);

  ipcMain.handle(VideoIPCChannels.GetVideoJsonData, getVideoJsonData);
  ipcMain.handle(VideoIPCChannels.SaveVideoJsonData, saveVideoJsonData);
};
