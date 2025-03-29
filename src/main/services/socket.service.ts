import { BrowserWindow } from "electron";
import * as http from "http";
import { Server } from "socket.io";
import {
  fetchFolderDetails,
  fetchVideoDetails,
  fetchVideosData,
  saveCurrentTime,
} from "./video-data.service";
import { getAllValues, setValue } from "../store";
import { loggingService as log } from "./main-logging.service";
import { AppSocketEvents } from "../../enums/app-socket-events.enum";
import { VideoCommands } from "../../models/video-commands.model";
import { VideoDataModel } from "../../models/videoData.model";
import * as net from "net";
import { serveLocalFile } from "./file.service";
import { handleVideoRequest } from "./video-streaming.service";
import { SettingsModel } from "../../models/settings.model";

// Utility functions for port management
const checkPortAvailability = (port: number): Promise<boolean> => {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once("error", () => resolve(false));
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

// Request handler for HTTP server
const createRequestHandler = () => {
  return (req: http.IncomingMessage, res: http.ServerResponse) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    
    if (req.method === "GET") {
      if (req.url === "/") {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("hello");
        return;
      }
      
      if (req.url?.startsWith("/video")) {
        handleVideoRequest(req, res);
        return;
      }
      
      if (req.url?.startsWith("/file")) {
        serveLocalFile(req, res);
        return;
      }
    }
    
    res.statusCode = 404;
    res.end();
  };
};

// Socket event handlers
const setupSocketHandlers = (io: Server, mainWindow: BrowserWindow) => {
  io.on("connection", (socket) => {
    log.info("A user connected:", socket.id);
    mainWindow.webContents.send("user-connected", socket.id);

    socket.on("disconnect", () => {
      mainWindow.webContents.send("user-disconnected", socket.id);
      log.info("User disconnected:", socket.id);
    });

    // Command handling
    socket.on(AppSocketEvents.REMOTE_COMMAND, (command: VideoCommands) => {
      mainWindow.webContents.send("video-command", command);
    });

    // Video playback control
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
      }
    );

    // Settings management
    socket.on(
      AppSocketEvents.GET_SETTINGS,
      async (
        _event: Electron.IpcMainInvokeEvent,
        callback: (response: {
          success: boolean;
          data?: SettingsModel;
          error?: string;
        }) => void
      ) => {
        try {
          callback({ success: true, data: getAllValues() });
        } catch (error) {
          log.error("Error fetching settings:", error);
          callback({ success: false, error: "Failed to fetch settings" });
        }
      }
    );

    // Data retrieval handlers
    const createDataHandler = <T>(
      handler: (data: any) => Promise<T>,
      errorMessage: string
    ) => {
      return async (
        requestData: { data: any },
        callback: (response: {
          success: boolean;
          data?: T;
          error?: string;
        }) => void
      ) => {
        try {
          const data = await handler(requestData?.data);
          callback({ success: true, data });
        } catch (error) {
          console.error(`${errorMessage}:`, error);
          callback({ success: false, error: errorMessage });
        }
      };
    };

    socket.on(
      AppSocketEvents.GET_VIDEOS_DATA,
      createDataHandler<VideoDataModel[]>(
        (data) => fetchVideosData({
          filePath: data?.filepath,
          includeThumbnail: data?.includeThumbnail,
          searchText: "",
          category: data?.category,
        }),
        "Failed to fetch videos data"
      )
    );

    socket.on(
      AppSocketEvents.GET_FOLDER_DETAILS,
      createDataHandler<VideoDataModel>(
        (data) => fetchFolderDetails(data?.filepath),
        "Failed to fetch folder details"
      )
    );

    socket.on(
      AppSocketEvents.GET_VIDEO_DETAILS,
      createDataHandler<VideoDataModel>(
        (data) => fetchVideoDetails(data?.filepath, data?.category),
        "Failed to fetch video details"
      )
    );

    // Time management
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
        }) => void
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
      }
    );
  });
};

// Main initialization function
export async function initializeSocket(
  mainWindow: BrowserWindow,
  startPort: number
): Promise<void> {
  const port = await findAvailablePort(startPort);
  const server = http.createServer(createRequestHandler());
  const io = new Server(server, { cors: { origin: "*" } });

  setupSocketHandlers(io, mainWindow);

  server.listen(port, () => {
    setValue("port", port.toString());
    log.info(`Server running on port ${port}`);
  });
}