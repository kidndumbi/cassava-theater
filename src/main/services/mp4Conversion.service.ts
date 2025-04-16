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

export async function convertToMp4(inputPath: string): Promise<{ fromPath: string; toPath: string } | void> {
  const mainWindow = getMainWindow();
  const stats = await fs.stat(inputPath);

  if (
    !stats.isFile() ||
    !VIDEO_EXTENSIONS.includes(path.extname(inputPath).toLowerCase())
  ) {
    // Not a supported video file
    return;
  }

  const ext = path.extname(inputPath);
  const base = inputPath.slice(0, -ext.length);
  const mp4Path = base + ".mp4";
  if (inputPath.toLowerCase().endsWith(".mp4")) {
    return; // Already mp4
  }
  // If mp4 already exists, skip conversion
  try {
    await fs.access(mp4Path);
    // Check if the mp4 file is valid and has a duration
    // If it has a duration, we assume it's already converted
    await videoDataHelpers.calculateDuration(mp4Path);
    console.log(`Skipping "${inputPath}", already converted to "${mp4Path}"`);
    return;
  } catch (err) {
    console.log(`Did not find "${mp4Path}" or error accessing it.`);
    console.log("error object:", err);
    // mp4 does not exist, proceed
  }
  console.log(`Converting "${inputPath}" to "${mp4Path}"`);
  return new Promise<{ fromPath: string; toPath: string }>((resolve, reject) => {
    ffmpeg(inputPath)
      .output(mp4Path)
      .on("progress", (progress) => {
        if (progress.percent) {
          process.stdout.write(
            `Progress: ${progress.percent.toFixed(2)}%   \r`,
          );
          if (mainWindow) {
            mainWindow.webContents.send("mp4-conversion-progress", {
              file: `${inputPath}:::${mp4Path}`,
              percent: progress.percent,
            });
          }
        }
      })
      .on("end", async () => {
        console.log(`\nFinished: "${mp4Path}"`);
        const previousData = await videoDataHelpers.readJsonData(inputPath);
        await videoDataHelpers.writeJsonToFile(mp4Path, previousData);
        resolve({ fromPath: inputPath, toPath: mp4Path });
      })
      .on("error", (err) => {
        console.error(`Error converting "${inputPath}"`, err);
        reject(err);
      })
      .run();
  });
}
