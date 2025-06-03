import { BrowserWindow } from "electron";
import * as http from "http";
import { Server } from "socket.io";
import * as settingsDataDbService from "../services/settingsDataDb.service";
import {
  fetchFolderDetails,
  fetchVideoDetails,
  fetchVideosData,
  saveCurrentTime,
  fetchWatchlaterVideos,
  fetchRecentlyWatchedCustomVideosData,
  fetchRecentlyWatchedVideosData,
} from "./video-data.service";
import { loggingService as log } from "./main-logging.service";
import { AppSocketEvents } from "../../enums/app-socket-events.enum";
import { VideoCommands } from "../../models/video-commands.model";
import { VideoDataModel } from "../../models/videoData.model";
import * as net from "net";
import { serveLocalFile } from "./file.service";
import { handleVideoRequest } from "./video-streaming.service";
import { SettingsModel } from "../../models/settings.model";
import { PlaylistModel } from "../../models/playlist.model";
import * as playlistDbService from "./playlistDb.service";
import { PlaylistPlayRequestModel } from "../../models/playlistPlayRequest.model";
import {
  getYoutubeVideoInfo,
  downloadYoutubeVideo,
  getYoutubeDownloadQueueInstance,
} from "../services/youtube.service";
import { PlaylistCommands } from "../../models/playlist-commands.model";
import { getCurrentlyPlayingInstance } from "./currentlyPlaying.service";
import { setSocketIoGlobal } from "../socketGlobalManager";

const currentlyPlaying = getCurrentlyPlayingInstance();

// Function to check if a port is available
const checkPortAvailability = (port: number): Promise<boolean> => {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => {
      resolve(false);
    });
    server.once("listening", () => {
      server.close();
      resolve(true);
    });
    server.listen(port);
  });
};

const findAvailablePort = async (startPort: number): Promise<number> => {
  let port = startPort;
  while (!(await checkPortAvailability(port))) {
    port += 1;
  }
  return port;
};

// Initialize the HTTP server and Socket.IO events.
export async function initializeSocket(
  mainWindow: BrowserWindow,
  startPort: number,
): Promise<void> {
  const port = await findAvailablePort(startPort);
  // Create HTTP server
  const server = http.createServer();

  // Configure request listener with proper type annotations.
  server.on(
    "request",
    (req: http.IncomingMessage, res: http.ServerResponse) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      if (req.method === "GET" && req.url === "/") {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("hello");
      } else if (
        req.method === "GET" &&
        req.url &&
        req.url?.startsWith("/video")
      ) {
        handleVideoRequest(req, res);
      } else if (
        req.method === "GET" &&
        req.url &&
        req.url?.startsWith("/file")
      ) {
        serveLocalFile(req, res);
      } else {
        res.statusCode = 404;
        res.end();
      }
    },
  );

  // Initialize Socket.IO server
  const io = new Server(server, { cors: { origin: "*" } });
  setSocketIoGlobal(io);

  io.on("connection", (socket) => {
    log.info("A user connected:", socket.id);
    mainWindow.webContents.send("user-connected", socket.id);

    socket.on("disconnect", () => {
      mainWindow.webContents.send("user-disconnected", socket.id);
      log.info("User disconnected:", socket.id);
    });

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
      AppSocketEvents.SET_PLAYING_PLAYLIST,
      (data: PlaylistPlayRequestModel) => {
        mainWindow.webContents.send("set-current-playlist", data);
        currentlyPlaying.setCurrentPlaylist(data.playlist);
        currentlyPlaying.setCurrentVideo(data.video);
      },
    );

    socket.on(
      AppSocketEvents.PLAYLIST_REMOTE_COMMAND,
      (command: PlaylistCommands) => {
        mainWindow.webContents.send(
          AppSocketEvents.PLAYLIST_REMOTE_COMMAND,
          command,
        );
      },
    );

    socket.on(
      AppSocketEvents.GET_SETTINGS,
      async (
        _event: Electron.IpcMainInvokeEvent,
        callback: (response: {
          success: boolean;
          data?: SettingsModel;
          error?: string;
        }) => void,
      ) => {
        try {
          const settings = await settingsDataDbService.getAllSettings();
          callback({ success: true, data: settings });
        } catch (error) {
          log.error("Error fetching videos data:", error);
          callback({ success: false, error: "Failed to fetch videos data" });
        }
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
          // Replace with actual logic to fetch folder details
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
          // Replace with actual logic to fetch folder details
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

    // New event: fetchWatchlaterVideos
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

    // New event: fetchRecentlyWatchedCustomVideosData
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

    // New event: fetchRecentlyWatchedVideosData
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

    // New event: getAllPlaylists
    socket.on(
      AppSocketEvents.GET_ALL_PLAYLISTS,
      async (
        _requestData: unknown,
        callback: (response: {
          success: boolean;
          data?: PlaylistModel[];
          error?: string;
        }) => void,
      ) => {
        try {
          const playlists = await playlistDbService.getAllPlaylists();
          callback({ success: true, data: playlists });
        } catch (error) {
          log.error("Error fetching playlists:", error);
          callback({ success: false, error: "Failed to fetch playlists" });
        }
      },
    );

    // --- YouTube socket events ---
    socket.on(
      AppSocketEvents.YT_GET_VIDEO_INFO,
      async (
        requestData: { data: { url: string } },
        callback: (response: {
          success: boolean;
          data?: any;
          error?: string;
        }) => void,
      ) => {
        try {
          const { url } = requestData.data;
          const data = await getYoutubeVideoInfo(url);
          callback({ success: true, data });
        } catch (error) {
          callback({ success: false, error: (error as Error).message });
        }
      },
    );

    socket.on(
      AppSocketEvents.YT_DOWNLOAD_VIDEO,
      async (
        requestData: { data: { url: string; destinationPath: string } },
        callback: (response: { success: boolean; error?: string }) => void,
      ) => {
        try {
          await downloadYoutubeVideo(
            requestData.data.url,
            requestData.data.destinationPath,
          );
          callback({ success: true });
        } catch (error) {
          callback({ success: false, error: (error as Error).message });
        }
      },
    );

    socket.on(
      AppSocketEvents.YT_ADD_TO_DOWNLOAD_QUEUE,
      async (
        requestData: {
          data: {
            title: string;
            url: string;
            destinationPath: string;
            poster: string;
            backdrop: string;
          };
        },
        callback: (response: { success: boolean; error?: string }) => void,
      ) => {
        try {
          getYoutubeDownloadQueueInstance().addToQueue(requestData.data);
          callback({ success: true });
        } catch (error) {
          callback({ success: false, error: (error as Error).message });
        }
      },
    );

    socket.on(
      AppSocketEvents.YT_REMOVE_FROM_QUEUE,
      async (
        requestData: { data: { id: string } },
        callback: (response: { success: boolean; error?: string }) => void,
      ) => {
        try {
          getYoutubeDownloadQueueInstance().removeFromQueue(
            requestData.data.id,
          );
          callback({ success: true });
        } catch (error) {
          callback({ success: false, error: (error as Error).message });
        }
      },
    );

    socket.on(
      AppSocketEvents.YT_IS_PROCESSING_QUEUE,
      async (
        _requestData: unknown,
        callback: (response: {
          success: boolean;
          data?: boolean;
          error?: string;
        }) => void,
      ) => {
        try {
          const data = getYoutubeDownloadQueueInstance().isProcessingQueue();
          callback({ success: true, data });
        } catch (error) {
          callback({ success: false, error: (error as Error).message });
        }
      },
    );

    socket.on(
      AppSocketEvents.YT_CLEAR_QUEUE,
      async (
        _requestData: unknown,
        callback: (response: { success: boolean; error?: string }) => void,
      ) => {
        try {
          getYoutubeDownloadQueueInstance().clearQueue();
          callback({ success: true });
        } catch (error) {
          callback({ success: false, error: (error as Error).message });
        }
      },
    );

    socket.on(
      AppSocketEvents.YT_GET_QUEUE,
      async (
        _requestData: unknown,
        callback: (response: {
          success: boolean;
          data?: any;
          error?: string;
        }) => void,
      ) => {
        try {
          const data = getYoutubeDownloadQueueInstance().getQueue();
          callback({ success: true, data });
        } catch (error) {
          callback({ success: false, error: (error as Error).message });
        }
      },
    );

    socket.on(
      AppSocketEvents.YT_SWAP_QUEUE_ITEMS,
      async (
        requestData: { data: { id1: string; id2: string } },
        callback: (response: { success: boolean; error?: string }) => void,
      ) => {
        try {
          getYoutubeDownloadQueueInstance().swapQueueItems(
            requestData.data.id1,
            requestData.data.id2,
          );
          callback({ success: true });
        } catch (error) {
          callback({ success: false, error: (error as Error).message });
        }
      },
    );
    // --- end YouTube socket events ---
  });

  server.listen(port, () => {
    settingsDataDbService.setSetting("port", port.toString());
    log.info(`Server running on port ${port}`);
  });
}
