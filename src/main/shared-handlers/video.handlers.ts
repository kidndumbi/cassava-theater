import { ipcMain, BrowserWindow } from "electron";
import { Socket } from "socket.io";
import { VideoIPCChannels } from "../../enums/VideoIPCChannels";
import { AppSocketEvents } from "../../enums/app-socket-events.enum";
import { VideoCommands } from "../../models/video-commands.model";
import { VideoDataModel } from "../../models/videoData.model";
import { TvShowDetails } from "../../models/tv-show-details.model";
import {
  fetchFolderDetails,
  fetchVideoDetails,
  fetchVideosData,
  getVideoJsonData,
  saveCurrentTime,
  saveVideoJsonData,
  AddTvShowFolder,
  getFolderFiles,
  fetchRecentlyWatchedVideosData,
  fetchRecentlyWatchedCustomVideosData,
  fetchWatchlaterVideos,
} from "../services/video-data.service";
import { generateThumbnail } from "../services/thumbnail.service";
import { calculateDuration } from "../services/video.helpers";
import { loggingService as log } from "../services/main-logging.service";

export const registerVideoHandlers = {
  ipc(): void {
    ipcMain.handle(VideoIPCChannels.FetchVideoData, async (_event, args: { filePath: string; includeThumbnail: boolean; category: string }) => {
      return fetchVideosData(args);
    });
    ipcMain.handle(VideoIPCChannels.FetchVideoDetails, async (_event, args: { path: string; category: string }) => {
      return fetchVideoDetails(args.path, args.category);
    });
    ipcMain.handle(VideoIPCChannels.FetchFolderDetails, async (_event, args: { path: string }) => {
      return fetchFolderDetails(args.path.replace("/", "\\"));
    });
    ipcMain.handle(VideoIPCChannels.SaveCurrentTime, saveCurrentTime);
    ipcMain.handle(VideoIPCChannels.GetVideoJsonData, getVideoJsonData);
    ipcMain.handle(VideoIPCChannels.SaveVideoJsonData, saveVideoJsonData);
    ipcMain.handle(VideoIPCChannels.AddTvShowFolder, async (_event, args: { tvShowName: string; subfolders: string[]; tvShowDetails: TvShowDetails | null; tvShowsFolderPath: string; poster: string; backdrop: string }) => {
      return AddTvShowFolder(args);
    });
    ipcMain.handle(VideoIPCChannels.GetFolderFiles, async (_event, folderPath: string) => {
      return getFolderFiles(folderPath);
    });
    ipcMain.handle(VideoIPCChannels.GetScreenshot, async (_event, videoData: VideoDataModel) => {
      if (!videoData.filePath) throw new Error("Video file path is required");
      const duration = videoData?.duration && videoData.duration > 0 ? videoData.duration : await calculateDuration(videoData.filePath);
      return generateThumbnail(videoData.filePath, videoData.currentTime ?? 0, duration);
    });
    ipcMain.handle(VideoIPCChannels.FetchRecentlyWatchedVideosData, async (_event, args: { videoType: "movies" | "tvShows"; limit?: number }) => {
      return fetchRecentlyWatchedVideosData(args.videoType, args.limit);
    });
    ipcMain.handle(VideoIPCChannels.FetchRecentlyWatchedCustomVideosData, async (_event, args: { limit?: number }) => {
      return fetchRecentlyWatchedCustomVideosData(args?.limit);
    });
    ipcMain.handle(VideoIPCChannels.FetchWatchlaterVideos, async () => {
      return fetchWatchlaterVideos();
    });
  },

  socket(socket: Socket, mainWindow: BrowserWindow): void {
    socket.on(AppSocketEvents.REMOTE_COMMAND, (command: VideoCommands) => {
      mainWindow.webContents.send("video-command", command);
    });
    socket.on(AppSocketEvents.SET_PLAYING, (data: { video: VideoDataModel; queryParams: { menuId: string; resumeId: string; startFromBeginning: string } }) => {
      mainWindow.webContents.send("set-current-video", data);
    });
    socket.on(AppSocketEvents.GET_VIDEOS_DATA, async (requestData: { data: { filepath: string; includeThumbnail: boolean; category: string } }, callback: (r: { success: boolean; data?: VideoDataModel[]; error?: string }) => void) => {
      try {
        const videosdata = await fetchVideosData({ filePath: requestData?.data?.filepath, includeThumbnail: requestData?.data?.includeThumbnail, category: requestData?.data?.category });
        callback({ success: true, data: videosdata });
      } catch (error) {
        log.error("Error fetching videos data:", error);
        callback({ success: false, error: "Failed to fetch videos data" });
      }
    });
    socket.on(AppSocketEvents.GET_FOLDER_DETAILS, async (requestData: { data: { filepath: string } }, callback: (r: { success: boolean; data?: VideoDataModel; error?: string }) => void) => {
      try {
        const folderDetails = await fetchFolderDetails(requestData?.data?.filepath);
        callback({ success: true, data: folderDetails });
      } catch (error) {
        log.error("Error fetching folder details:", error);
        callback({ success: false, error: "Failed to fetch folder details" });
      }
    });
    socket.on(AppSocketEvents.GET_VIDEO_DETAILS, async (requestData: { data: { filepath: string; category: string } }, callback: (r: { success: boolean; data?: VideoDataModel; error?: string }) => void) => {
      try {
        const videoDetails = await fetchVideoDetails(requestData?.data?.filepath, requestData?.data?.category);
        callback({ success: true, data: videoDetails });
      } catch (error) {
        log.error("Error fetching video details:", error);
        callback({ success: false, error: "Failed to fetch video details" });
      }
    });
    socket.on(AppSocketEvents.SET_CURRENTTIME, async (requestData: { data: { currentVideo: VideoDataModel; currentTime: number; isEpisode?: boolean } }, callback: (r: { success: boolean; data?: VideoDataModel; error?: string }) => void) => {
      try {
        const updated = await saveCurrentTime({} as Electron.IpcMainInvokeEvent, { currentVideo: requestData?.data?.currentVideo, currentTime: requestData?.data?.currentTime, isEpisode: requestData?.data?.isEpisode });
        callback({ success: true, data: updated });
      } catch (error) {
        log.error("Error setting current time:", error);
        callback({ success: false, error: "Failed to set current time" });
      }
    });
    socket.on(AppSocketEvents.FETCH_WATCHLATER_VIDEOS, async (_req: unknown, callback: (r: { success: boolean; data?: VideoDataModel[]; error?: string }) => void) => {
      try {
        const videos = await fetchWatchlaterVideos();
        callback({ success: true, data: videos });
      } catch (error) {
        log.error("Error fetching watchlater videos:", error);
        callback({ success: false, error: "Failed to fetch watchlater videos" });
      }
    });
    socket.on(AppSocketEvents.FETCH_RECENTLY_WATCHED_CUSTOM_VIDEOS, async (requestData: { data?: { limit?: number } }, callback: (r: { success: boolean; data?: { folder: { id: string; name: string; folderPath: string }; videos: VideoDataModel[] }[]; error?: string }) => void) => {
      try {
        const data = await fetchRecentlyWatchedCustomVideosData(requestData?.data?.limit ?? 20);
        callback({ success: true, data });
      } catch (error) {
        log.error("Error fetching recently watched custom videos:", error);
        callback({ success: false, error: "Failed to fetch recently watched custom videos" });
      }
    });
    socket.on(AppSocketEvents.FETCH_RECENTLY_WATCHED_VIDEOS, async (requestData: { data: { videoType: "movies" | "tvShows"; limit?: number } }, callback: (r: { success: boolean; data?: VideoDataModel[]; error?: string }) => void) => {
      try {
        const { videoType, limit = 20 } = requestData.data;
        const videos = await fetchRecentlyWatchedVideosData(videoType, limit);
        callback({ success: true, data: videos });
      } catch (error) {
        log.error("Error fetching recently watched videos:", error);
        callback({ success: false, error: "Failed to fetch recently watched videos" });
      }
    });
  },
};