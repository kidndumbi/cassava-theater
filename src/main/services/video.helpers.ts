import { access, writeFile } from "fs/promises";
import { Stats } from "fs";
import * as helpers from "./helpers";
import * as path from "path";
import ffmpeg from "fluent-ffmpeg";
import { loggingService as log } from "./main-logging.service";

import { ThumbnailCache } from "./thumbnailCache.service";
import { generateThumbnail } from "./thumbnail.service";

import { VideoDataModel } from "../../models/videoData.model";
import * as lockFile from "proper-lockfile";
import { app } from "electron";
import { fileExists, normalizeFilePath, readFileData } from "./helpers";

const VIDEO_META_DATA_FILE_NAME = app.getPath("userData") + "/videoData.json";

export const filterByCategory = (
  videos: VideoDataModel[],
  category: string,
) => {
  if (["movies", "episodes"].includes(category)) {
    return videos.filter(
      (vid) => vid.fileName && /\.[^.]+$/.test(vid.fileName),
    );
  }
  return videos;
};

export async function readJsonData(
  filePath: string,
  defaultData: VideoDataModel = {
    notes: [],
    overview: {},
  },
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
  jsonData: VideoDataModel,
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
      JSON.stringify(currentData, null, 2),
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
  searchText?: string,
): boolean {
  return searchText &&
    !file.toLowerCase().includes(searchText.toLowerCase()) &&
    !stats.isDirectory()
    ? false
    : true;
}

export const filterFilesNotMarkedForDeletion = (
  files: string[],
  filePath: string,
  markedForDeletion: string[],
): string[] => {
  return files.filter((file) => {
    const fullPath = path.join(filePath, file);
    return !markedForDeletion.includes(helpers.normalizeFilePath(fullPath));
  });
};

export const sortVideoData = (
  videoData: VideoDataModel[],
): VideoDataModel[] => {
  return videoData.sort((a, b) => {
    const directoryDifference = Number(b.isDirectory) - Number(a.isDirectory);
    if (directoryDifference === 0 && a.createdAt && b.createdAt) {
      return b.createdAt - a.createdAt;
    }
    return directoryDifference;
  });
};

export async function getVideoThumbnails(
  video: VideoDataModel,
  cache: ThumbnailCache,
  duration: number,
): Promise<VideoDataModel> {
  if (!video.isDirectory) {
    if (!video.filePath) {
      throw new Error("Video file path is undefined");
    }
    const cacheKey = helpers.normalizeFilePath(video.filePath);
    let videoProgressScreenshot = cache[cacheKey]?.image;

    const thumbnailPromise =
      !videoProgressScreenshot ||
      cache[cacheKey].currentTime !== (video.currentTime ?? 30)
        ? video.filePath
          ? await generateThumbnail(
              video.filePath,
              video.currentTime ?? 30,
              ffmpeg,
              duration,
            )
          : Promise.resolve(undefined)
        : Promise.resolve(videoProgressScreenshot);

    try {
      videoProgressScreenshot = await thumbnailPromise;
      if (
        !cache[cacheKey] ||
        cache[cacheKey].currentTime !== (video.currentTime ?? 30)
      ) {
        cache[cacheKey] = {
          image: videoProgressScreenshot,
          currentTime: video.currentTime ?? 30,
        };
      }
      video.videoProgressScreenshot = videoProgressScreenshot;
    } catch (error) {
      log.error(
        `Error generating thumbnail for video ${video.filePath}:`,
        error,
      );
      video.videoProgressScreenshot = helpers.DEFAULT_THUMBNAIL_URL;
    }
  } else {
    video.videoProgressScreenshot = undefined;
  }
  return video;
}
