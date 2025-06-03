import { app, BrowserWindow, ipcMain } from "electron";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { registerIpcHandlers } from "./main/ipc-handlers/ipcHandlers";
import { loggingService as log } from "./main/services/main-logging.service";
import { initializeSocket } from "./main/services/socket-io/socket.service";
import * as cleanUp from "./main/services/cleanUp.service";
import * as appSetup from "./main/services/setup.service";
import { setMainWindow } from "./main/mainWindowManager";
import { levelDBService } from "./main/services/levelDB.service";
import * as settingsDataDbService from "./main/services/settingsDataDb.service";

declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle Windows installer/uninstaller
if (require("electron-squirrel-startup")) {
  log.info("Electron Squirrel startup detected, quitting app.");
  app.quit();
}

appSetup.initializeFfmpeg();
cleanUp.runAppOpeningCleanup();

// Main Window Management
let mainWindow: BrowserWindow | null = null;

const createWindow = (): BrowserWindow => {
  const window = new BrowserWindow({
    height: 900,
    width: 1600,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      // contextIsolation: true,
      // sandbox: true,
    },
    autoHideMenuBar: true,
    show: false,
  });

  window.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  window.on("ready-to-show", () => {
    window.show();
    if (!app.isPackaged) {
      window.webContents.openDevTools({ mode: "detach" });
    }
  });

  window.on("closed", () => {
    mainWindow = null;
    setMainWindow(null);
  });

  return window;
};

// App Lifecycle
app.on("ready", async () => {
  try {
    mainWindow = createWindow();
    setMainWindow(mainWindow);

    registerIpcHandlers();

    const portFromDb = await settingsDataDbService.getSetting("port");

    const port = parseInt((portFromDb as string) || "5000", 10);
    initializeSocket(mainWindow, port);
  } catch (err) {
    log.error("App initialization failed:", err);
    app.quit();
  }
});

app.on("before-quit", async () => {
  try {
    await levelDBService.close();
    log.info("Application shutdown completed");
  } catch (err) {
    log.error("Failed to cleanly shutdown:", err);
  }
});

// IPC Events
ipcMain.on("restart-app", () => {
  log.info("Restarting app...");
  app.relaunch();
  app.exit(0);
});

// Window Management
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
