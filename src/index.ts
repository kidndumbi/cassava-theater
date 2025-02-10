import { app, BrowserWindow, ipcMain } from "electron";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { registerIpcHandlers } from "./main/ipc-handlers/ipcHandlers";
import { initializeStore, getValue } from "./main/store";
import { loggingService as log } from "./main/services/main-logging.service";
import { initializeSocket } from "./main/services/socket.service";
import {
  installExtension,
  REDUX_DEVTOOLS,
  REACT_DEVELOPER_TOOLS,
} from "electron-devtools-installer";

// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  log.info("Electron Squirrel startup detected, quitting app.");
  app.quit();
}

initializeStore();

let mainWindow: BrowserWindow | null = null;

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
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
};

const rawPort = getValue("port") as string;
const settingsPort = rawPort || "5000";
const port: number = parseInt(settingsPort, 10);
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  registerIpcHandlers();
  createWindow();
  // Initialize the socket service after the main window is created.
  if (mainWindow) {
    initializeSocket(mainWindow, port);
  }
});

// app.whenReady().then(() => {
//   if (app.isPackaged) {
//     return;
//   }
//   installExtension([REDUX_DEVTOOLS, REACT_DEVELOPER_TOOLS])
//     .then(([redux, react]) =>
//       console.log(`Added Extensions:  ${redux.name}, ${react.name}`)
//     )
//     .catch((err) => console.log("An error occurred: ", err));

//   installExtension("fmkadmapgofadopljbjfkapdkoienihi")
//     .then((name) => console.log(`Added Extension:  ${name}`))
//     .catch((err) => console.log("An error occurred: ", err));
// });

ipcMain.on("restart-app", () => {
  log.info("Restarting app...");
  app.relaunch();
  app.exit(0);
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    log.info("All windows closed, quitting app.");
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
