import ffmpeg from "fluent-ffmpeg";
import { app } from "electron";
import * as path from "path";
import * as fs from "fs";
import { spawn, ChildProcess } from "child_process";
import { loggingService as log } from "./main-logging.service";

let libreTranslateProcess: ChildProcess | null = null;

function getFfprobeBinaryPath(): string {
  const platform = process.platform;
  const arch = process.arch === "x64" ? "x64" : process.arch;

  const binaryName = platform === "win32" ? "ffprobe.exe" : "ffprobe";

  if (app.isPackaged) {
    return path.join(process.resourcesPath, binaryName);
  }

  let platformDir = "win32";
  if (platform === "darwin") platformDir = "darwin";
  else if (platform === "linux") platformDir = "linux";

  return path.join(
    app.getAppPath(),
    "node_modules",
    "ffprobe-static",
    "bin",
    platformDir,
    arch,
    binaryName,
  );
}

export const initializeFfmpeg = () => {
  const ffprobePath = getFfprobeBinaryPath();

  if (fs.existsSync(ffprobePath)) {
    ffmpeg.setFfprobePath(ffprobePath);
    log.info(`ffprobe path resolved: ${ffprobePath}`);
  } else {
    log.error(`ffprobe binary not found at: ${ffprobePath}`);
    throw new Error(
      "ffprobe binary not found. Please ensure ffprobe-static is installed correctly.",
    );
  }
};

export const initializeLibreTranslate = () => {
  try {
    log.info("🌐 Starting LibreTranslate server...");
    
    const languages = process.env.LIBRETRANSLATE_LANGUAGES || "en,es,fr";
    libreTranslateProcess = spawn("libretranslate", ["--load-only", languages], {
      stdio: ["ignore", "pipe", "pipe"],
      detached: false,
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
