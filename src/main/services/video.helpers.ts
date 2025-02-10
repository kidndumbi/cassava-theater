import { readFile, access, writeFile } from "fs/promises";
import { Stats } from "fs";
import { loggingService as log } from "./main-logging.service";
import { VideoDataModel } from "../../models/videoData.model";
import * as lockFile from "proper-lockfile";
import * as path from "path";

const VIDEO_META_DATA_FILE_NAME = "videoData.json";

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

function getVideoDataFilepath(filePath: string): string {
  const normalizedFilePath = filePath.replace(/\\/g, "/");
  const videoMetaDataFilePath = path.join(
    path.dirname(normalizedFilePath),
    VIDEO_META_DATA_FILE_NAME
  );

  return videoMetaDataFilePath;
}

export async function readJsonData(
  filePath: string,
  defaultData: VideoDataModel = {
    notes: [],
    overview: {},
  }
) {
  const videoMetaDataFilePath = getVideoDataFilepath(filePath);

  if (await fileExists(videoMetaDataFilePath)) {
    const file = await readFileData(videoMetaDataFilePath);
    const fileJson = JSON.parse(file);
    const videoData = fileJson[normalizeFilePath(filePath)] || defaultData;
    return videoData;
  }
  return defaultData;
}

export const writeJsonToFile = async (
  filePath: string,
  jsonData: VideoDataModel
): Promise<VideoDataModel> => {
  let release: (() => Promise<void>) | null = null;
  try {
    const normalizedFilePath = normalizeFilePath(filePath);
    const videoMetaDataFilePath = path.join(
      path.dirname(normalizedFilePath),
      VIDEO_META_DATA_FILE_NAME
    );
    try {
      await access(videoMetaDataFilePath);
    } catch {
      await writeFile(videoMetaDataFilePath, "{}");
    }
    release = await lockFile.lock(videoMetaDataFilePath, { retries: 3 });

    let currentData: Record<string, VideoDataModel> = {};
    const content = await readFileData(videoMetaDataFilePath);
    if (content) {
      try {
        currentData = JSON.parse(content);
      } catch {
        currentData = {};
      }
    }

    currentData[normalizeFilePath(filePath)] = jsonData;

    await writeFile(
      videoMetaDataFilePath,
      JSON.stringify(currentData, null, 2)
    );
    return jsonData;
  } finally {
    if (release) {
      await release();
    }
  }
};

function normalizeFilePath(filePath: string): string {
  return filePath.replace(/\\/g, "/");
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
