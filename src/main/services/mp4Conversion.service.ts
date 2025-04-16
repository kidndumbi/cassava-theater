import * as fs from "fs/promises";
import * as path from "path";
import ffmpeg from "fluent-ffmpeg";
import { getMainWindow } from "../mainWindowManager";
import * as videoDataHelpers from "./video.helpers";

const VIDEO_EXTENSIONS = [
  ".mkv",
  ".avi",
  ".mov",
  ".wmv",
  ".flv",
  ".webm",
  ".mpg",
  ".mpeg",
  ".3gp",
];

async function getAllVideoFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries
    .filter(
      (entry) =>
        entry.isFile() &&
        VIDEO_EXTENSIONS.includes(path.extname(entry.name).toLowerCase()),
    )
    .map((entry) => path.resolve(dir, entry.name));
}

export async function convertToMp4(inputPath: string): Promise<void> {
  const mainWindow = getMainWindow();
  const stats = await fs.stat(inputPath);
  let filesToConvert: string[] = [];

  if (stats.isDirectory()) {
    filesToConvert = await getAllVideoFiles(inputPath);
  } else if (VIDEO_EXTENSIONS.includes(path.extname(inputPath).toLowerCase())) {
    filesToConvert = [inputPath];
  } else {
    // Not a supported video file or directory
    return;
  }

  for (const file of filesToConvert) {
    const ext = path.extname(file);
    const base = file.slice(0, -ext.length);
    const mp4Path = base + ".mp4";
    if (file.toLowerCase().endsWith(".mp4")) {
      continue; // Already mp4
    }
    // If mp4 already exists, skip conversion
    try {
      await fs.access(mp4Path);
      // Check if the mp4 file is valid and has a duration
      // If it has a duration, we assume it's already converted
      await videoDataHelpers.calculateDuration(mp4Path);
      console.log(`Skipping "${file}", already converted to "${mp4Path}"`);
      continue;
    } catch (err) {
      console.log(`Did not find "${mp4Path}" or error accessing it.`);
      console.log("error object:", err);
      // mp4 does not exist, proceed
    }
    console.log(`Converting "${file}" to "${mp4Path}"`);
    await new Promise<void>((resolve, reject) => {
      ffmpeg(file)
        .output(mp4Path)
        .on("progress", (progress) => {
          if (progress.percent) {
            process.stdout.write(
              `Progress: ${progress.percent.toFixed(2)}%   \r`,
            );
            if (mainWindow) {
              mainWindow.webContents.send("mp4-conversion-progress", {
                file: `${file}:::${mp4Path}`,
                percent: progress.percent,
              });
            }
          }
        })
        .on("end", () => {
          console.log(`\nFinished: "${mp4Path}"`);
          resolve();
        })
        .on("error", (err) => {
          console.error(`Error converting "${file}"`, err);
          reject(err);
        })
        .run();
    });
  }
}
