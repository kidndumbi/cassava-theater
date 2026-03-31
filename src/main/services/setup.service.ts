import ffmpeg from "fluent-ffmpeg";
import { app } from "electron";
import * as path from "path";
import * as fs from "fs";
import { spawn, ChildProcess } from "child_process";
import { loggingService as log } from "./main-logging.service";

let libreTranslateProcess: ChildProcess | null = null;

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

export const initializeLibreTranslate = () => {
  try {
    log.info("🌐 Starting LibreTranslate server...");
    
    libreTranslateProcess = spawn('libretranslate', ['--load-only', 'en,es,fr'], {
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: false
    });

    log.info(`🚀 LibreTranslate process started with PID: ${libreTranslateProcess.pid}`);

    libreTranslateProcess.stdout?.on('data', (data) => {
      const output = data.toString().trim();
      if (output) {
        log.info(`📝 LibreTranslate: ${output}`);
      }
    });

    libreTranslateProcess.stderr?.on('data', (data) => {
      const errorOutput = data.toString().trim();
      if (errorOutput) {
        // Filter out common non-error messages
        if (errorOutput.includes('Loading model') || errorOutput.includes('Ready')) {
          log.info(`🔧 LibreTranslate: ${errorOutput}`);
        } else {
          log.error(`❌ LibreTranslate error: ${errorOutput}`);
        }
      }
    });

    libreTranslateProcess.on('close', (code) => {
      if (code !== null) {
        log.info(`🏁 LibreTranslate process exited with code: ${code}`);
      }
      libreTranslateProcess = null;
    });

    libreTranslateProcess.on('error', (error) => {
      log.error(`❌ Failed to start LibreTranslate:`, error);
      libreTranslateProcess = null;
    });

  } catch (error) {
    log.error("Failed to initialize LibreTranslate:", error);
  }
};

export const stopLibreTranslate = () => {
  if (libreTranslateProcess) {
    log.info("🛑 Stopping LibreTranslate server...");
    libreTranslateProcess.kill('SIGTERM');
    libreTranslateProcess = null;
  }
};
