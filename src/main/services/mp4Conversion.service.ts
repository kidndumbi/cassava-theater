import * as fs from "fs/promises";
import * as path from "path";
import ffmpeg, { FfprobeData } from "fluent-ffmpeg";
import { getMainWindow } from "../mainWindowManager";
import * as videoDataHelpers from "./video.helpers";

const VIDEO_EXTENSIONS = new Set([
  ".mkv",
  ".avi",
  ".mov",
  ".wmv",
  ".flv",
  ".webm",
  ".mpg",
  ".mpeg",
  ".3gp",
]);

interface ConversionResult {
  fromPath: string;
  toPath: string;
}

// Define the progress type based on fluent-ffmpeg's actual structure
interface ConversionProgress {
  percent?: number;
  frames?: number;
  currentFps?: number;
  currentKbps?: number;
  targetSize?: number;
  timemark?: string;
}

export async function convertToMp4(inputPath: string): Promise<ConversionResult | undefined> {
  const mainWindow = getMainWindow();

  if (!(await isConvertibleVideoFile(inputPath))) {
    return undefined;
  }

  const mp4Path = getMp4Path(inputPath);
  
  if (await isAlreadyConverted(mp4Path)) {
    return undefined;
  }

  console.log(`Converting "${inputPath}" to "${mp4Path}"`);
  return performConversion(inputPath, mp4Path, mainWindow);
}

async function isConvertibleVideoFile(filePath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(filePath);
    const ext = path.extname(filePath).toLowerCase();
    return stats.isFile() && VIDEO_EXTENSIONS.has(ext);
  } catch (error) {
    console.error(`Error checking file ${filePath}:`, error);
    return false;
  }
}

function getMp4Path(inputPath: string): string {
  const ext = path.extname(inputPath);
  return inputPath.slice(0, -ext.length) + ".mp4";
}

async function isAlreadyConverted(mp4Path: string): Promise<boolean> {
  try {
    await fs.access(mp4Path);
    await videoDataHelpers.calculateDuration(mp4Path);
    console.log(`Skipping conversion, "${mp4Path}" already exists and is valid`);
    return true;
  } catch (error) {
    console.log(`Proceeding with conversion, "${mp4Path}" not found or invalid`);
    return false;
  }
}

function performConversion(
  inputPath: string,
  mp4Path: string,
  mainWindow: Electron.BrowserWindow | null
): Promise<ConversionResult> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .output(mp4Path)
      .on("progress", (progress: ConversionProgress) => 
        handleProgress(progress, inputPath, mp4Path, mainWindow))
      .on("end", () => handleConversionEnd(inputPath, mp4Path, resolve))
      .on("error", (err: Error) => handleConversionError(inputPath, err, reject))
      .run();
  });
}

function handleProgress(
  progress: ConversionProgress,
  inputPath: string,
  mp4Path: string,
  mainWindow: Electron.BrowserWindow | null
) {
  if (progress.percent) {
    process.stdout.write(`Progress: ${progress.percent.toFixed(2)}%   \r`);
    mainWindow?.webContents.send("mp4-conversion-progress", {
      file: `${inputPath}:::${mp4Path}`,
      percent: progress.percent,
    });
  }
}

async function handleConversionEnd(
  inputPath: string,
  mp4Path: string,
  resolve: (value: ConversionResult) => void
) {
  console.log(`\nFinished: "${mp4Path}"`);
  try {
    const previousData = await videoDataHelpers.readJsonData(inputPath);
    await videoDataHelpers.writeJsonToFile(mp4Path, previousData);
    resolve({ fromPath: inputPath, toPath: mp4Path });
  } catch (error) {
    console.error(`Error handling metadata for "${mp4Path}":`, error);
    // Still resolve as the conversion itself succeeded
    resolve({ fromPath: inputPath, toPath: mp4Path });
  }
}

function handleConversionError(
  inputPath: string,
  error: Error,
  reject: (reason?: unknown) => void
) {
  console.error(`Error converting "${inputPath}"`, error);
  reject(error);
}