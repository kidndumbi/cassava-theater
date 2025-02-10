import { readFile, access, writeFile } from "fs/promises";
import { Stats } from "fs";
import { loggingService as log } from "./main-logging.service";
import { VideoDataModel } from "../../models/videoData.model";
import * as lockFile from "proper-lockfile";

export const filterByCategory = (
  videos: VideoDataModel[],
  category: string
) => {
  if (["movies", "episodes"].includes(category)) {
    return videos.filter(
      (vid) => vid.fileName && /\.[^.]+$/.test(vid.fileName)
    );
  }
  return videos;
};

export async function readJsonData(
  filePath: string,
  defaultData: VideoDataModel = {
    notes: [],
    overview: {},
  }
) {
  if (await fileExists(filePath)) {
    const file = await readFileData(filePath);
    return file ? JSON.parse(file) : defaultData;
  }
  return defaultData;
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function readFileData(
  filePath: string
): Promise<string | undefined> {
  try {
    const jsonFile = await readFile(filePath);
    return jsonFile?.toString();
  } catch (error) {
    log.error("Error in readFileData:", error);
  }
}

export function shouldProcessFile(
  file: string,
  stats: Stats,
  searchText?: string
): boolean {
  return searchText &&
    !file.toLowerCase().includes(searchText.toLowerCase()) &&
    !stats.isDirectory()
    ? false
    : true;
}

export const getJsonFilePath = (filePath: string): string => {
  if (!filePath) {
    throw new Error("filePath is undefined!");
  }

  if (
    filePath.toLowerCase().endsWith(".mp4") ||
    filePath.toLowerCase().endsWith(".mkv")
  ) {
    return filePath.replace(/\.(mp4|mkv)$/i, ".json");
  }

  // Check if the filePath has no extension and append .json
  if (!filePath.includes(".")) {
    return `${filePath}.json`;
  }

  return filePath;
};

export const writeJsonToFile = async (
  filePath: string,
  jsonData: VideoDataModel
): Promise<VideoDataModel> => {
  // Acquire a lock on the file (or its directory if file may not exist)
  let release: (() => Promise<void>) | null = null;
  try {
    // Ensure the file exists to lock it; if not, create an empty file.
    try {
      await access(filePath);
    } catch {
      await writeFile(filePath, "{}");
    }
    release = await lockFile.lock(filePath, { retries: 3 });

    await writeFile(filePath, JSON.stringify(jsonData, null, 2));
    return jsonData;
  } finally {
    if (release) {
      await release();
    }
  }
};
