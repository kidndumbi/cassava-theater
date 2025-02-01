import { app, BrowserWindow } from "electron";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { registerIpcHandlers } from "./main/ipc-handlers/ipcHandlers";
import { getAllValues, initializeStore } from "./main/store";
import { Server } from "socket.io";
import * as http from "http";
import { handleVideoRequest } from "./main/services/video.service";
import { AppSocketEvents } from "./enums/app-socket-events.enum";
import { VideoCommands } from "./models/video-commands.model";
import { loggingService } from "./main/services/main-logging.service";

// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  loggingService.info("Electron Squirrel startup detected, quitting app.");
  app.quit();
}

initializeStore();

const server = http.createServer();

// Add request listener to the server
server.on("request", (req: http.IncomingMessage, res: http.ServerResponse) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // Allow any origin
  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("hello");
  } else if (req.method === "GET" && req.url && req.url.startsWith("/video")) {
    handleVideoRequest(req, res);
  }
});

const io = new Server(server, { cors: { origin: "*" } });

let mainWindow: BrowserWindow | null = null;

io.on("connection", (socket) => {
  loggingService.info("A user connected:", socket.id);
  mainWindow.webContents.send("user-connected", socket.id);
  socket.on("disconnect", () => {
    mainWindow.webContents.send("user-disconnected", socket.id);
    loggingService.info("User disconnected:", socket.id);
  });

  socket.on(AppSocketEvents.REMOTE_COMMAND, (command: VideoCommands) => {
    if (mainWindow) {
      mainWindow.webContents.send("video-command", command);
    }
  });

  socket.on(
    AppSocketEvents.GET_SETTINGS,
    async (requestData: {}, callback: (response: any) => void) => {
      try {
        const settings = getAllValues();
        callback({ success: true, data: settings });
      } catch (error) {
        loggingService.error("Error fetching videos data:", error);
        callback({ success: false, error: "Failed to fetch videos data" });
      }
    }
  );
});

const createWindow = (): void => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  mainWindow.removeMenu();

  // and load the index.html of the app.
  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
};

const port = process.env.PORT || 4002;
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  registerIpcHandlers();
  createWindow();
  server.listen(port, () => {
    loggingService.info(`Server running on port ${port}`);
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    loggingService.info("All windows closed, quitting app.");
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
