import ffmpeg from "fluent-ffmpeg";
import { app } from "electron";
import * as path from "path";
import * as fs from "fs";
import { loggingService as log } from "./main-logging.service";

export const initializeFfmpeg = () => {
  let ffprobePath = path.join(
    app.getAppPath(),
    "node_modules",
    "ffprobe-static",
    "bin",
    "win32",
    "x64",
    "ffprobe.exe",
  );

  if (app.isPackaged) {
    ffprobePath = path.join(process.resourcesPath, "ffprobe.exe");
  }

  if (fs.existsSync(ffprobePath)) {
    ffmpeg.setFfprobePath(ffprobePath);
  } else {
    log.error("ffprobe.exe does not exist at the resolved path.");
    throw new Error(
      "ffprobe binary not found. Please ensure ffprobe-static is installed correctly.",
    );
  }
};
