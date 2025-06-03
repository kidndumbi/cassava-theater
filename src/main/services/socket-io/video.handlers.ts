import { AppSocketEvents } from "../../../enums/app-socket-events.enum";
import { VideoCommands } from "../../../models/video-commands.model";
import { VideoDataModel } from "../../../models/videoData.model";
import { fetchFolderDetails, fetchVideoDetails, fetchVideosData, saveCurrentTime, fetchWatchlaterVideos, fetchRecentlyWatchedCustomVideosData, fetchRecentlyWatchedVideosData } from "../video-data.service";
import { loggingService as log } from "../main-logging.service";
import { Socket } from "socket.io/dist";
import { BrowserWindow } from "electron";

export function registerVideoHandlers(socket: Socket, mainWindow: BrowserWindow) {
  socket.on(AppSocketEvents.REMOTE_COMMAND, (command: VideoCommands) => {
    mainWindow.webContents.send("video-command", command);
  });

  socket.on(
    AppSocketEvents.SET_PLAYING,
    (data: {
      video: VideoDataModel;
      queryParams: {
        menuId: string;
        resumeId: string;
        startFromBeginning: string;
      };
    }) => {
      mainWindow.webContents.send("set-current-video", data);
    },
  );

  socket.on(
    AppSocketEvents.GET_VIDEOS_DATA,
    async (
      requestData: {
        data: {
          filepath: string;
          includeThumbnail: boolean;
          category: string;
        };
      },
      callback: (response: {
        success: boolean;
        data?: VideoDataModel[];
        error?: string;
      }) => void,
    ) => {
      try {
        const videosdata = await fetchVideosData({
          filePath: requestData?.data?.filepath,
          includeThumbnail: requestData?.data?.includeThumbnail,
          category: requestData?.data?.category,
        });
        callback({ success: true, data: videosdata });
      } catch (error) {
        console.error("Error fetching videos data:", error);
        callback({ success: false, error: "Failed to fetch videos data" });
      }
    },
  );

  socket.on(
    AppSocketEvents.GET_FOLDER_DETAILS,
    async (
      requestData: {
        data: {
          filepath: string;
        };
      },
      callback: (response: {
        success: boolean;
        data?: VideoDataModel;
        error?: string;
      }) => void,
    ) => {
      try {
        const folderDetails = await fetchFolderDetails(
          requestData?.data?.filepath,
        );
        callback({ success: true, data: folderDetails });
      } catch (error) {
        console.error("Error fetching folder details:", error);
        callback({ success: false, error: "Failed to fetch folder details" });
      }
    },
  );

  socket.on(
    AppSocketEvents.GET_VIDEO_DETAILS,
    async (
      requestData: {
        data: {
          filepath: string;
          category: string;
        };
      },
      callback: (response: {
        success: boolean;
        data?: VideoDataModel;
        error?: string;
      }) => void,
    ) => {
      try {
        const videoDetails = await fetchVideoDetails(
          requestData?.data?.filepath,
          requestData?.data?.category,
        );
        callback({ success: true, data: videoDetails });
      } catch (error) {
        console.error("Error fetching folder details:", error);
        callback({ success: false, error: "Failed to fetch folder details" });
      }
    },
  );

  socket.on(
    AppSocketEvents.SET_CURRENTTIME,
    async (
      requestData: {
        data: {
          currentVideo: VideoDataModel;
          currentTime: number;
          isEpisode?: boolean;
        };
      },
      callback: (response: {
        success: boolean;
        data?: VideoDataModel;
        error?: string;
      }) => void,
    ) => {
      try {
        const updatedVideoData = await saveCurrentTime(null, {
          currentVideo: requestData?.data?.currentVideo,
          currentTime: requestData?.data?.currentTime,
          isEpisode: requestData?.data?.isEpisode,
        });
        callback({ success: true, data: updatedVideoData });
      } catch (error) {
        console.error("Error setting current time:", error);
        callback({ success: false, error: "Failed to set current time" });
      }
    },
  );

  socket.on(
    AppSocketEvents.FETCH_WATCHLATER_VIDEOS,
    async (
      _requestData: unknown,
      callback: (response: {
        success: boolean;
        data?: VideoDataModel[];
        error?: string;
      }) => void,
    ) => {
      try {
        const videos = await fetchWatchlaterVideos();
        callback({ success: true, data: videos });
      } catch (error) {
        log.error("Error fetching watchlater videos:", error);
        callback({
          success: false,
          error: "Failed to fetch watchlater videos",
        });
      }
    },
  );

  socket.on(
    AppSocketEvents.FETCH_RECENTLY_WATCHED_CUSTOM_VIDEOS,
    async (
      requestData: { data?: { limit?: number } },
      callback: (response: {
        success: boolean;
        data?: {
          folder: {
            id: string;
            name: string;
            folderPath: string;
          };
          videos: VideoDataModel[];
        }[];
        error?: string;
      }) => void,
    ) => {
      try {
        const limit = requestData?.data?.limit ?? 20;
        const data = await fetchRecentlyWatchedCustomVideosData(limit);
        callback({ success: true, data });
      } catch (error) {
        log.error("Error fetching recently watched custom videos:", error);
        callback({
          success: false,
          error: "Failed to fetch recently watched custom videos",
        });
      }
    },
  );

  socket.on(
    AppSocketEvents.FETCH_RECENTLY_WATCHED_VIDEOS,
    async (
      requestData: {
        data: { videoType: "movies" | "tvShows"; limit?: number };
      },
      callback: (response: {
        success: boolean;
        data?: VideoDataModel[];
        error?: string;
      }) => void,
    ) => {
      try {
        const { videoType, limit = 20 } = requestData.data;
        const videos = await fetchRecentlyWatchedVideosData(videoType, limit);
        callback({ success: true, data: videos });
      } catch (error) {
        log.error("Error fetching recently watched videos:", error);
        callback({
          success: false,
          error: "Failed to fetch recently watched videos",
        });
      }
    },
  );
}
