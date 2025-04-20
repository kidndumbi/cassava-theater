import { readdir, stat } from "fs/promises";
import { Stats } from "fs";
import * as fs from "fs";
import * as helpers from "./helpers";
import * as videoDbDataService from "./videoDbData.service";
import * as markedForDeleteService from "./markedForDelete.service";
import * as path from "path";
import ffmpeg from "fluent-ffmpeg";
import { loggingService as log } from "./main-logging.service";
import { generateThumbnail } from "./thumbnail.service";
import { VideoDataModel } from "../../models/videoData.model";
import { normalizeFilePath } from "./helpers";
import { TvShowDetails } from "../../models/tv-show-details.model";

/**
 * Filters an array of video objects based on the provided category.
 *
 * For the "movies" and "episodes" categories, it returns only those videos that:
 * - Have a fileName defined.
 * - Have a valid file extension (i.e. fileName ends with a dot and some non-dot characters).
 *
 * For any other category, the function returns the videos array without any filtering.
 *
 * @param videos - The array of video data objects.
 * @param category - The category to filter by.
 * @returns The filtered array of videos.
 */
export const filterByCategory = (
  videos: VideoDataModel[],
  category: string,
): VideoDataModel[] => {
  const categoriesToFilter = ["movies", "episodes"];

  if (categoriesToFilter.includes(category)) {
    return videos.filter((video) => {
      const hasFileName = Boolean(video.fileName);
      // The regex checks if fileName ends with a dot and one or more non-dot characters,
      // ensuring that the fileName includes a valid file extension.
      const hasValidExtension = /\.[^.]+$/.test(video.fileName);
      return hasFileName && hasValidExtension;
    });
  }

  return videos;
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

export async function getVideoThumbnail(
  video: VideoDataModel,
  duration: number,
): Promise<VideoDataModel> {
  if (!video.isDirectory) {
    if (!video.filePath) {
      throw new Error("Video file path is undefined");
    }
    try {
      const videoProgressScreenshot = await generateThumbnail(
        video.filePath,
        video.currentTime ?? 30,
        ffmpeg,
        duration,
      );
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

export const getRootVideoData = async (
  event: Electron.IpcMainInvokeEvent,
  filePath: string,
  searchText: string,
  category: string,
): Promise<VideoDataModel[]> => {
  const videoData: VideoDataModel[] = [];

  try {
    const markedForDeletion = await markedForDeleteService.getAllMarkedForDelete();
    const files = await readdir(filePath);

    const filteredFiles = filterFilesNotMarkedForDeletion(
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

    return sortVideoData(videoData);
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

      if (!shouldProcessFile(file, stats, searchText)) {
        return;
      }

      if (helpers.isVideoFile(file) || stats.isDirectory()) {
        const data = await populateVideoData(file, filePath, stats, category);
        data.filePath = normalizeFilePath(data.filePath); // Normalize the file path for consistency
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
    const fullFilePath = path.join(filePath, file);
    const videoDb = await videoDbDataService.getVideo(
      normalizeFilePath(fullFilePath),
    );
    const duration = videoDb?.duration > 0 ? videoDb.duration :  await calculateDuration(fullFilePath);
    const videoData = createVideoDataObject(
      file,
      fullFilePath,
      stats.isDirectory(),
      stats.birthtimeMs,
      filePath,
      duration,
      videoDb,
      category,
    );

    if (stats.isDirectory()) {
      videoData.childFolders = await getSortedChildFolders(fullFilePath);
    }

    return videoData;
  } catch (error: unknown) {
    log.error("Error populating video data:", error);
    return null;
  }
};

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



export const updateParentVideoData = async (
  currentVideo: VideoDataModel,
  currentTime: number,
) => {
  if (!currentVideo.filePath) {
    throw new Error("currentVideo.filePath is undefined");
  }

  const parentFilePath = path.dirname(currentVideo.filePath);
  const grandParentFilePath = path.dirname(parentFilePath);
  const grandParentJsonFilePath = grandParentFilePath;

  const grandParentJsonFileContents = await videoDbDataService.getVideo(
    normalizeFilePath(grandParentJsonFilePath),
  );
  grandParentJsonFileContents.lastVideoPlayed = currentVideo.filePath;
  grandParentJsonFileContents.lastVideoPlayedTime = currentTime;
  grandParentJsonFileContents.lastVideoPlayedDate = new Date().toISOString();
  grandParentJsonFileContents.lastVideoPlayedDuration = currentVideo.duration;
  await videoDbDataService.putVideo(
    normalizeFilePath(grandParentJsonFilePath),
    grandParentJsonFileContents,
  );

  return {
    lastVideoPlayed: grandParentJsonFileContents.lastVideoPlayed,
    lastVideoPlayedTime: grandParentJsonFileContents.lastVideoPlayedTime,
    lastVideoPlayedDate: grandParentJsonFileContents.lastVideoPlayedDate,
    lastVideoPlayedDuration:
      grandParentJsonFileContents.lastVideoPlayedDuration,
  };
};

export const getSortedChildFolders = async (
  dirPath: string,
): Promise<{ folderPath: string; basename: string }[]> => {
  const childFoldersPromises = fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map(async (dirent) => {
      const folderPath = path.join(dirPath, dirent.name).replace(/\\/g, "/");
      return {
        folderPath,
        basename: dirent.name,
      };
    });
  const childFolders = await Promise.all(childFoldersPromises);
  const sortedChildFolders = childFolders.sort((a, b) => {
    const isASeason = a.basename?.toLowerCase().startsWith("season");
    const isBSeason = b.basename?.toLowerCase().startsWith("season");
    if (isASeason && !isBSeason) return -1; // "Season" folders come first
    if (!isASeason && isBSeason) return 1; // Non-"Season" folders go to the bottom
    return (a.basename ?? "").localeCompare(b.basename ?? "", undefined, {
      numeric: true,
      sensitivity: "base",
    });
  });
  return sortedChildFolders;
};
