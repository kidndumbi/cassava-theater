import { BrowserWindow } from "electron";
import * as http from "http";
import { Server } from "socket.io";
import {
  fetchFolderDetails,
  fetchVideosData,
  handleVideoRequest,
  saveLastWatch,
} from "../services/video.service";
import { getAllValues, setValue } from "../store";
import { loggingService as log } from "./main-logging.service";
import { AppSocketEvents } from "../../enums/app-socket-events.enum";
import { VideoCommands } from "../../models/video-commands.model";
import { VideoDataModel } from "../../models/videoData.model";
import * as net from "net";
import { serveLocalFile } from "./file.service";

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
  startPort: number
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
        req.url.startsWith("/video")
      ) {
        handleVideoRequest(req, res);
      } else if (
        req.method === "GET" &&
        req.url &&
        req.url.startsWith("/file")
      ) {
        serveLocalFile(req, res);
      } else {
        res.statusCode = 404;
        res.end();
      }
    }
  );

  // Initialize Socket.IO server
  const io = new Server(server, { cors: { origin: "*" } });
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
      }
    );

    socket.on(
      AppSocketEvents.GET_SETTINGS,
      async (_: {}, callback: (response: any) => void) => {
        try {
          const settings = getAllValues();
          callback({ success: true, data: settings });
        } catch (error) {
          log.error("Error fetching videos data:", error);
          callback({ success: false, error: "Failed to fetch videos data" });
        }
      }
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
        callback: (response: any) => void
      ) => {
        try {
          const videosdata = await fetchVideosData({
            filePath: requestData?.data?.filepath,
            includeThumbnail: requestData?.data?.includeThumbnail,
            searchText: "",
            category: requestData?.data?.category,
          });
          callback({ success: true, data: videosdata });
        } catch (error) {
          console.error("Error fetching videos data:", error);
          callback({ success: false, error: "Failed to fetch videos data" });
        }
      }
    );

    socket.on(
      AppSocketEvents.GET_FOLDER_DETAILS,
      async (
        requestData: {
          data: {
            filepath: string;
          };
        },
        callback: (response: any) => void
      ) => {
        try {
          // Replace with actual logic to fetch folder details
          const folderDetails = await fetchFolderDetails(
            requestData?.data?.filepath
          );
          callback({ success: true, data: folderDetails });
        } catch (error) {
          console.error("Error fetching folder details:", error);
          callback({ success: false, error: "Failed to fetch folder details" });
        }
      }
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
        callback: (response: any) => void
      ) => {
        try {
          console.log("set-currenttime::: ", requestData);
          // Replace with actual logic to set current time
          const updatedVideoData = await saveLastWatch(null, {
            currentVideo: requestData?.data?.currentVideo,
            lastWatched: requestData?.data?.currentTime,
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

  server.listen(port, () => {
    setValue("port", port.toString());
    log.info(`Server running on port ${port}`);
  });
}
