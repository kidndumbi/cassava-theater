import { BrowserWindow } from "electron";
import * as http from "http";
import { Server, Socket } from "socket.io";
import * as settingsDataDbService from "../settingsDataDb.service";
import { loggingService as log } from "../main-logging.service";

import * as net from "net";
import { serveLocalFile } from "../file.service";
import { handleVideoRequest } from "../video-streaming.service";

import { setSocketIoGlobal } from "../../socketGlobalManager";
import { registerVideoHandlers } from "./videoSocket.handlers";
import { registerPlaylistHandlers } from "./playlistSocket.handlers";
import { registerSettingsHandlers } from "./settingsSocket.handlers";
import { registerYoutubeHandlers } from "./youtubeSocket.handlers";
import { registerCurrentlyPlayingHandlers } from "./currentlyPlayingSocket.handlers";
import { registerMp4ConversionHandlers } from "./mp4ConversionSocket.handlers";
import { registerImagesSocketHandlers } from "./imagesSocket.handlers";
import { registerLlmSocketHandlers } from "./llmSocket.handlers";

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

  io.on("connection", (socket: Socket) => {
    log.info("A user connected:", socket.id);
    socket.join(socket.id);
    mainWindow.webContents.send("user-connected", socket.id);

    socket.on("disconnect", () => {
      mainWindow.webContents.send("user-disconnected", socket.id);
      log.info("User disconnected:", socket.id);
    });

    // Register grouped handlers
    registerVideoHandlers(socket, mainWindow);
    registerPlaylistHandlers(socket, mainWindow);
    registerSettingsHandlers(socket);
    registerYoutubeHandlers(socket, mainWindow);
    registerCurrentlyPlayingHandlers(socket);
    registerMp4ConversionHandlers(socket, mainWindow);
    registerImagesSocketHandlers(socket);
    registerLlmSocketHandlers(socket);
  });

  server.listen(port, () => {
    settingsDataDbService.setSetting("port", port.toString());
    log.info(`Server running on port ${port}`);
  });
}
