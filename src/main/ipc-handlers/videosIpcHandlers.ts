import { TvShowDetails } from "./../../models/tv-show-details.model";
import { ipcMain } from "electron";
import { VideoIPCChannels } from "../../enums/VideoIPCChannels";
import {
  fetchFolderDetails,
  fetchVideoDetails,
  fetchVideosData,
  getVideoJsonData,
  saveCurrentTime,
  saveVideoJsonData,
  AddTvShowFolder,
} from "../services/video-data.service";
import { addToConversionQueue } from "../services/mp4Conversion.service";

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
      },
    ) => {
      return fetchVideosData(args);
    },
  );

  ipcMain.handle(
    VideoIPCChannels.FetchVideoDetails,
    (
      _event: Electron.IpcMainInvokeEvent,
      args: { path: string; category: string },
    ) => {
      return fetchVideoDetails(args.path, args.category);
    },
  );

  ipcMain.handle(
    VideoIPCChannels.FetchFolderDetails,
    (_event: Electron.IpcMainInvokeEvent, args: { path: string }) => {
      return fetchFolderDetails(args.path.replace("/", "\\"));
    },
  );

  ipcMain.handle(VideoIPCChannels.SaveCurrentTime, saveCurrentTime);

  ipcMain.handle(VideoIPCChannels.GetVideoJsonData, getVideoJsonData);
  ipcMain.handle(VideoIPCChannels.SaveVideoJsonData, saveVideoJsonData);

  ipcMain.handle(
    VideoIPCChannels.AddTvShowFolder,
    (
      _event: Electron.IpcMainInvokeEvent,
      args: {
        tvShowName: string;
        subfolders: string[];
        tvShowDetails: TvShowDetails | null;
        tvShowsFolderPath: string;
      },
    ) => {
      return AddTvShowFolder(args);
    },
  );

  ipcMain.handle(
    VideoIPCChannels.AddToConversionQueue,
    async (_event: Electron.IpcMainInvokeEvent, inputPath: string) => {
      return addToConversionQueue(inputPath);
    },
  );
};
