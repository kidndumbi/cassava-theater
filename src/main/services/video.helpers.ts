import { access, writeFile } from "fs/promises";
import { Stats } from "fs";

import { VideoDataModel } from "../../models/videoData.model";
import * as lockFile from "proper-lockfile";
import { app } from "electron";
import { fileExists, normalizeFilePath, readFileData } from "./helpers";

const VIDEO_META_DATA_FILE_NAME = app.getPath("userData") + "/videoData.json";

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
  if (await fileExists(VIDEO_META_DATA_FILE_NAME)) {
    const file = await readFileData(VIDEO_META_DATA_FILE_NAME);
    const fileJson = JSON.parse(file);
    const videoData = (fileJson[normalizeFilePath(filePath)] ||
      defaultData) as VideoDataModel;
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
    try {
      await access(VIDEO_META_DATA_FILE_NAME);
    } catch {
      await writeFile(VIDEO_META_DATA_FILE_NAME, "{}");
    }
    release = await lockFile.lock(VIDEO_META_DATA_FILE_NAME, { retries: 3 });

    let currentData: Record<string, VideoDataModel> = {};
    const content = await readFileData(VIDEO_META_DATA_FILE_NAME);
    if (content) {
      try {
        currentData = JSON.parse(content);
      } catch {
        currentData = {};
      }
    }

    currentData[normalizeFilePath(filePath)] = jsonData;

    await writeFile(
      VIDEO_META_DATA_FILE_NAME,
      JSON.stringify(currentData, null, 2)
    );
    return jsonData;
  } finally {
    if (release) {
      await release();
    }
  }
};

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
