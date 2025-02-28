import * as fs from "fs";
import { stat, readdir } from "fs/promises";
import { Stats } from "fs";
import * as path from "path";
import { VideoDataModel } from "../../models/videoData.model";
import ffmpeg from "fluent-ffmpeg";
import { loggingService as log } from "./main-logging.service";

import {
  readThumbnailCache,
  writeThumbnailCache,
} from "./thumbnailCache.service";
import { TvShowDetails } from "../../models/tv-show-details.model";
import * as videoDataHelpers from "./video.helpers";
import * as helpers from "./helpers";

export const fetchVideosData = async ({
  filePath,
  searchText,
  includeThumbnail,
  category,
}: {
  filePath: string;
  searchText: string | undefined;
  includeThumbnail: boolean;
  category: string;
}): Promise<VideoDataModel[]> => {
  if (!filePath) {
    throw new Error("Path is required");
  }

  if (!fs.existsSync(filePath)) {
    throw new Error(`Path does not exist: ${filePath}`);
  }

  try {
    const videoData: VideoDataModel[] = await getRootVideoData(
      null,
      filePath,
      searchText || "",
      category,
    );

    let updatedVideoData: VideoDataModel[];

    if (includeThumbnail) {
      const thumbnailCacheFilePath = helpers.getThumbnailCacheFilePath();
      const cache = readThumbnailCache(thumbnailCacheFilePath);

      const getVideoThumbnailsPromises = videoData.map((video) =>
        videoDataHelpers.getVideoThumbnails(video, cache, video.duration),
      );

      updatedVideoData = await Promise.all(getVideoThumbnailsPromises);

      writeThumbnailCache(cache, thumbnailCacheFilePath);
    } else {
      updatedVideoData = videoData;
    }

    const sorted = updatedVideoData.sort((a, b) =>
      (a.fileName ?? "").localeCompare(b.fileName ?? ""),
    );

    return videoDataHelpers.filterByCategory(sorted, category);
  } catch (error) {
    log.error("Error fetching video list: ", error);
    throw new Error("Error fetching video list: " + error);
  }
};

export const fetchVideoDetails = async (
  filePath: string,
  category: string,
): Promise<VideoDataModel> => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Path does not exist: ${filePath}`);
  }

  try {
    const stats = await stat(filePath);
    const jsonFileContents = await videoDataHelpers.readJsonData(filePath);
    const duration = await calculateDuration(filePath);
    const fileName = path.basename(filePath);

    const videoDetails: VideoDataModel = createVideoDataObject(
      fileName,
      filePath,
      false,
      stats.birthtimeMs,
      "",
      duration,
      jsonFileContents,
      category,
    );

    const thumbnailCacheFilePath = helpers.getThumbnailCacheFilePath();
    const cache = readThumbnailCache(thumbnailCacheFilePath);
    const processedVideoData = await videoDataHelpers.getVideoThumbnails(
      videoDetails,
      cache,
      duration,
    );

    writeThumbnailCache(cache, thumbnailCacheFilePath);

    return processedVideoData;
  } catch (error) {
    log.error("Error fetching video details: ", error);
    throw new Error("Error fetching video details: " + error);
  }
};

export const fetchFolderDetails = async (
  dirPath: string,
): Promise<VideoDataModel> => {
  if (!fs.existsSync(dirPath)) {
    throw new Error(`Path does not exist: ${dirPath}`);
  }

  try {
    const jsonFileContents = await videoDataHelpers.readJsonData(dirPath);
    const basename = path.basename(dirPath);

    const childFoldersPromises = fs
      .readdirSync(dirPath, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map(async (dirent) => {
        const folderPath = path.join(dirPath, dirent.name).replace(/\\/g, "/");
        const jsonFileContents =
          await videoDataHelpers.readJsonData(folderPath);
        return {
          folderPath,
          basename: dirent.name,
          season_id: jsonFileContents?.season_id || null,
        };
      });

    const childFolders = await Promise.all(childFoldersPromises);

    const videoDetails: VideoDataModel = createFolderDataObject(
      basename,
      dirPath,
      jsonFileContents,
      jsonFileContents?.tv_show_details,
      childFolders,
    );

    return videoDetails;
  } catch (error) {
    log.error("Error fetching Folder details: ", error);
    throw new Error("Error fetching Folder details: " + error);
  }
};

export const saveCurrentTime = async (
  event: Electron.IpcMainInvokeEvent,
  {
    currentVideo,
    currentTime,
    isEpisode,
  }: { currentVideo: VideoDataModel; currentTime: number; isEpisode?: boolean },
) => {
  try {
    if (!currentVideo.filePath) {
      throw new Error("currentVideo.filePath is undefined");
    }

    const jsonFileContents = await videoDataHelpers.readJsonData(
      currentVideo.filePath,
    );
    jsonFileContents.currentTime = currentTime;
    jsonFileContents.watched = currentTime !== 0;
    jsonFileContents.lastVideoPlayedDate = new Date().toISOString();

    await videoDataHelpers.writeJsonToFile(
      currentVideo.filePath,
      jsonFileContents,
    );

    if (isEpisode) {
      if (!currentVideo.filePath) {
        throw new Error("currentVideo.filePath is undefined");
      }
      const parentFilePath = path.dirname(currentVideo.filePath);
      const grandParentFilePath = path.dirname(parentFilePath);
      const grandParentJsonFilePath = grandParentFilePath;

      const grandParentJsonFileContents = await videoDataHelpers.readJsonData(
        grandParentJsonFilePath,
      );
      grandParentJsonFileContents.lastVideoPlayed = currentVideo.filePath;
      grandParentJsonFileContents.lastVideoPlayedTime = currentTime;
      grandParentJsonFileContents.lastVideoPlayedDate =
        new Date().toISOString();
      grandParentJsonFileContents.lastVideoPlayedDuration =
        currentVideo.duration;

      await videoDataHelpers.writeJsonToFile(
        grandParentJsonFilePath,
        grandParentJsonFileContents,
      );
    }

    return jsonFileContents;
  } catch (error: unknown) {
    if (error instanceof Error) {
      log.error("save:saveLCurrentTime error ", error);
    } else {
      log.error("An unknown error occurred:", error);
    }
  }
};

export const getVideoJsonData = async (
  event: Electron.IpcMainInvokeEvent,
  currentVideo: VideoDataModel,
) => {
  try {
    const EMPTY_JSON_RESPONSE: VideoDataModel = { notes: [], overview: {} };

    if (!currentVideo || !currentVideo.filePath) {
      console.warn(
        "Warning: Received undefined or invalid currentVideo.filepath.",
      );
      return EMPTY_JSON_RESPONSE;
    }

    return (await videoDataHelpers.readJsonData(
      currentVideo.filePath,
    )) as VideoDataModel;
  } catch (error) {
    console.error("An error occurred:", error);
    return null;
  }
};

export const saveVideoJsonData = async (
  event: Electron.IpcMainInvokeEvent,
  {
    currentVideo,
    newVideoJsonData,
  }: { currentVideo: VideoDataModel; newVideoJsonData: VideoDataModel },
) => {
  try {
    const newFilePath = currentVideo.filePath || "";
    const existingData = await videoDataHelpers.readJsonData(
      newFilePath,
      {} as VideoDataModel,
    );
    const mergedData = {
      ...existingData,
      ...newVideoJsonData,
    } as VideoDataModel;
    await videoDataHelpers.writeJsonToFile(newFilePath, mergedData);
    return mergedData;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("An error occurred:", error.message);
    } else {
      console.error("An unknown error occurred:", error);
    }
    throw new Error("Failed to save video JSON data");
  }
};

export const getRootVideoData = async (
  event: Electron.IpcMainInvokeEvent,
  filePath: string,
  searchText: string,
  category: string,
): Promise<VideoDataModel[]> => {
  const videoData: VideoDataModel[] = [];

  try {
    const markedForDeletion = await helpers.getMarkedForDeletion();
    const files = await readdir(filePath);

    const filteredFiles = videoDataHelpers.filterFilesNotMarkedForDeletion(
      files,
      filePath,
      markedForDeletion,
    );
    await processFiles(
      filteredFiles,
      filePath,
      searchText,
      category,
      videoData,
    );

    return videoDataHelpers.sortVideoData(videoData);
  } catch (error) {
    log.error("An error occurred while fetching root video data: ", error);
    return videoData; // Return successfully processed data even if an error occurs
  }
};

const processFiles = async (
  files: string[],
  filePath: string,
  searchText: string,
  category: string,
  videoData: VideoDataModel[],
): Promise<void> => {
  const fileProcessingPromises = files.map(async (file) => {
    try {
      const fullPath = path.join(filePath, file);
      const stats = await stat(fullPath);

      if (!videoDataHelpers.shouldProcessFile(file, stats, searchText)) {
        return;
      }

      if (helpers.isVideoFile(file) || stats.isDirectory()) {
        const data = await populateVideoData(file, filePath, stats, category);
        if (data) {
          videoData.push(data);
        }
      }
    } catch (error) {
      log.error(`Skipping file ${file} due to error:`, error);
    }
  });

  await Promise.all(fileProcessingPromises);
};

export const populateVideoData = async (
  file: string,
  filePath: string,
  stats: Stats,
  category: string,
) => {
  try {
    const fullFilePath = `${filePath}/${file}`;
    const jsonFileContents = await videoDataHelpers.readJsonData(fullFilePath);

    const duration = await calculateDuration(fullFilePath);
    return createVideoDataObject(
      file,
      fullFilePath,
      stats.isDirectory(),
      stats.birthtimeMs,
      filePath,
      duration,
      jsonFileContents,
      category,
    );
  } catch (error: unknown) {
    log.error("Error populating video data:", error);
    return null;
  }
};

export const calculateDuration = async (file: string) => {
  let duration = 0;

  const ext = path.extname(file).toLowerCase();
  if ([".mp4", ".mkv", ".avi"].includes(ext)) {
    const maybeDuration = await getVideoDuration(file);
    if (typeof maybeDuration === "number") {
      duration = maybeDuration;
    }
  }
  return duration;
};

export function getVideoDuration(
  filePath: string,
): Promise<number | "unknown"> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        log.error("Error getting video duration: ", err);
        return reject(err);
      }
      const duration = metadata.format.duration;
      resolve(duration !== undefined ? duration : "unknown");
    });
  });
}

export const createVideoDataObject = (
  fileName: string,
  filePath: string,
  isDirectory: boolean,
  createdAt: number,
  rootPath: string,
  duration: number,
  jsonFileContents: VideoDataModel | null,
  category?: string,
): VideoDataModel => {
  let videoDataType: "movie" | "episode" | null = null;

  switch (category) {
    case "movies":
      videoDataType = "movie";
      break;
    case "episodes":
      videoDataType = "episode";
      break;
  }

  return {
    fileName,
    filePath,
    isDirectory,
    createdAt,
    rootPath,
    duration,
    mustWatch: jsonFileContents?.mustWatch || false,
    notesCount: jsonFileContents?.notes?.length || 0,
    watched: jsonFileContents?.watched || false,
    like: jsonFileContents?.like || false,
    currentTime: jsonFileContents?.currentTime || 0,
    season_id: jsonFileContents?.season_id || null,
    subtitlePath: jsonFileContents?.subtitlePath || null,
    lastVideoPlayedDate: jsonFileContents?.lastVideoPlayedDate || null,
    lastVideoPlayedTime: jsonFileContents?.lastVideoPlayedTime || 0,
    lastVideoPlayed: jsonFileContents?.lastVideoPlayed || null,
    lastVideoPlayedDuration: jsonFileContents?.lastVideoPlayedDuration || null,
    notes: jsonFileContents?.notes || [],
    overview: jsonFileContents?.overview || {},
    movie_details: jsonFileContents?.movie_details || null,
    tv_show_details: jsonFileContents?.tv_show_details || null,
    isMkv: filePath.toLowerCase().endsWith(".mkv"),
    isAvi: filePath.toLowerCase().endsWith(".avi"),
    watchLater: jsonFileContents?.watchLater || false,
    videoDataType,
    poster: jsonFileContents?.poster || null,
    backdrop: jsonFileContents?.backdrop || null,
  };
};

export const createFolderDataObject = (
  basePath: string,
  filePath: string,
  jsonFileContents: VideoDataModel | null,
  tv_show_details: TvShowDetails | null,
  childFolders: { folderPath: string; basename: string }[] = [],
): VideoDataModel => ({
  basePath,
  filePath,
  season_id: jsonFileContents?.season_id || null,
  tv_show_details,
  childFolders,
  lastVideoPlayed: jsonFileContents?.lastVideoPlayed,
  lastVideoPlayedTime: jsonFileContents?.lastVideoPlayedTime || 0,
  lastVideoPlayedDate: jsonFileContents?.lastVideoPlayedDate || null,
  poster: jsonFileContents?.poster || null,
  backdrop: jsonFileContents?.backdrop || null,
});
