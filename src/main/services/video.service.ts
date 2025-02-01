import { IncomingMessage, ServerResponse } from "http";
import * as fs from "fs";
import { stat, readdir } from "fs/promises";
import { Stats } from "fs";
import * as path from "path";
import { VideoDataModel } from "../../models/videoData.model";
import ffmpeg from "fluent-ffmpeg";
import { app } from "electron";
import { loggingService as log } from "./main-logging.service";

import {
  readThumbnailCache,
  ThumbnailCache,
  writeThumbnailCache,
} from "./thumbnailCache.service";
import { generateThumbnail } from "./thumbnail.service";
import { TvShowDetails } from "../../models/tv-show-details.model";
import {
  readOrDefaultJson,
  readJsonData,
  shouldProcessFile,
  getJsonFilePath,
  readJsonFile,
  writeJsonToFile,
  filterByCategory,
} from "./video.helpers";

let ffprobePath = path.join(
  app.getAppPath(),
  "node_modules",
  "ffprobe-static",
  "bin",
  "win32",
  "x64",
  "ffprobe.exe"
);

if (app.isPackaged) {
  ffprobePath = path.join(process.resourcesPath, "ffprobe.exe");
}

if (fs.existsSync(ffprobePath)) {
  ffmpeg.setFfprobePath(ffprobePath);
} else {
  log.error("ffprobe.exe does not exist at the resolved path.");
  throw new Error(
    "ffprobe binary not found. Please ensure ffprobe-static is installed correctly."
  );
}

const DEFAULT_THUMBNAIL_URL =
  "https://res.cloudinary.com/cassavacloudinary/image/upload/v1718668161/LBFilmReel_991x.progressive.jpg";

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
      searchText || ""
    );

    const thumbnailCacheFilePath = path.join(filePath, "thumbnailCache.json");

    const cache = readThumbnailCache(thumbnailCacheFilePath);

    const updatedVideoDataPromises = videoData.map((video) =>
      processVideoData(video, cache, includeThumbnail)
    );

    const updatedVideoData = await Promise.all(updatedVideoDataPromises);

    writeThumbnailCache(cache, thumbnailCacheFilePath);

    const sorted = updatedVideoData.sort((a, b) =>
      a.fileName!.localeCompare(b.fileName!)
    );

    return filterByCategory(sorted, category);
  } catch (error) {
    log.error("Error fetching video list: ", error);
    throw new Error("Error fetching video list: " + error);
  }
};

export const fetchVideoDetails = async (
  filePath: string
): Promise<VideoDataModel> => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Path does not exist: ${filePath}`);
  }

  try {
    const jsonFilePath = filePath.replace(".mp4", ".json");
    const stats = await stat(filePath);
    const jsonFileContents = await readJsonData(jsonFilePath);
    const duration = await calculateDuration(filePath);
    const fileName = path.basename(filePath);

    const videoDetails: VideoDataModel = createVideoDataObject(
      fileName,
      filePath,
      false,
      stats.birthtimeMs,
      "",
      duration,
      jsonFileContents
    );

    const thumbnailCacheFilePath = path.join(
      path.dirname(filePath),
      "thumbnailCache.json"
    );
    const cache = readThumbnailCache(thumbnailCacheFilePath);
    const processedVideoData = await processVideoData(videoDetails, cache);

    writeThumbnailCache(cache, thumbnailCacheFilePath);

    return processedVideoData;
  } catch (error) {
    log.error("Error fetching video details: ", error);
    throw new Error("Error fetching video details: " + error);
  }
};

export const fetchFolderDetails = async (
  dirPath: string
): Promise<VideoDataModel> => {
  if (!fs.existsSync(dirPath)) {
    throw new Error(`Path does not exist: ${dirPath}`);
  }

  try {
    const jsonFilePath = `${dirPath}.json`;
    const jsonFileContents = await readJsonData(jsonFilePath);
    const basename = path.basename(dirPath);

    const childFoldersPromises = fs
      .readdirSync(dirPath, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map(async (dirent) => {
        const folderPath = path.join(dirPath, dirent.name).replace(/\\/g, "/");
        const jsonFilePath = `${folderPath}.json`;
        const jsonFileContents = await readJsonData(jsonFilePath);
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
      childFolders
    );

    return videoDetails;
  } catch (error) {
    log.error("Error fetching Folder details: ", error);
    throw new Error("Error fetching Folder details: " + error);
  }
};

export const saveLastWatch = async (
  event: any,
  {
    currentVideo,
    lastWatched,
    isEpisode,
  }: { currentVideo: VideoDataModel; lastWatched: number; isEpisode?: boolean }
) => {
  try {
    const jsonFilePath = getJsonFilePath(currentVideo.filePath!);

    let jsonFileContents = (await readJsonFile(jsonFilePath)) || {
      notes: [],
      overview: {},
    };

    jsonFileContents.lastWatched = lastWatched;
    jsonFileContents.watched = lastWatched !== 0;
    jsonFileContents.lastVideoPlayedDate = new Date().toISOString();

    await writeJsonToFile(jsonFilePath, jsonFileContents);

    if (isEpisode) {
      const parentFilePath = path.dirname(currentVideo.filePath!);
      const grandParentFilePath = path.dirname(parentFilePath);
      const grandParentJsonFilePath = getJsonFilePath(grandParentFilePath);

      let grandParentJsonFileContents = (await readJsonFile(
        grandParentJsonFilePath
      )) || {
        notes: [],
        overview: {},
      };

      grandParentJsonFileContents.lastVideoPlayed = currentVideo.filePath;
      grandParentJsonFileContents.lastVideoPlayedTime = lastWatched;
      grandParentJsonFileContents.lastVideoPlayedDate =
        new Date().toISOString();
      grandParentJsonFileContents.lastVideoPlayedDuration =
        currentVideo.duration;

      await writeJsonToFile(
        grandParentJsonFilePath,
        grandParentJsonFileContents
      );
    }

    return jsonFileContents;
  } catch (error: unknown) {
    if (error instanceof Error) {
      log.error("save:lastWatch error ", error);
    } else {
      log.error("An unknown error occurred:", error);
    }
  }
};

export const getVideoJsonData = async (
  event: any,
  currentVideo: VideoDataModel
) => {
  try {
    // Constant for reusable value
    const EMPTY_JSON_RESPONSE: VideoDataModel = { notes: [], overview: {} };
    //Validate the input data
    if (!currentVideo || !currentVideo.filePath) {
      console.warn(
        "Warning: Received undefined or invalid currentVideo.filepath."
      );
      return EMPTY_JSON_RESPONSE;
      //throw new Error("Invalid input data");
    }

    // Construct the new file path using template literals
    const newFilePath = currentVideo.filePath.replace(".mp4", ".json");

    // Check if the file exists
    return await readOrDefaultJson(newFilePath);
  } catch (error) {
    // Handle the error appropriately
    console.error("An error occurred:", error);
    return null;
  }
};

export const saveVideoJsonData = async (
  event: any,
  {
    currentVideo,
    newVideoJsonData,
  }: { currentVideo: VideoDataModel; newVideoJsonData: VideoDataModel }
) => {
  try {
    const newFilePath = getJsonFilePath(currentVideo.filePath || "");
    const existingData = (await readJsonFile(newFilePath)) || {};
    const mergedData = { ...existingData, ...newVideoJsonData };
    await writeJsonToFile(newFilePath, mergedData);
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

async function processVideoData(
  video: VideoDataModel,
  cache: ThumbnailCache,
  includeThumbnail = true
): Promise<VideoDataModel> {
  if (!video.isDirectory) {
    const cacheKey = video.filePath!;
    let videoProgressScreenshot = cache[cacheKey]?.image;

    const thumbnailPromise =
      includeThumbnail &&
      (!videoProgressScreenshot ||
        cache[cacheKey].currentTime !== (video.currentTime ?? 30))
        ? generateThumbnail(video.filePath!, video.currentTime ?? 30, ffmpeg)
        : Promise.resolve(videoProgressScreenshot);

    try {
      if (includeThumbnail) {
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
      }
    } catch (error) {
      log.error(
        `Error generating thumbnail for video ${video.filePath}:`,
        error
      );
      video.videoProgressScreenshot = DEFAULT_THUMBNAIL_URL;
    }
  } else {
    video.videoProgressScreenshot = undefined;
  }
  return video;
}

export const getRootVideoData = async (
  event: any,
  filePath: string,
  searchText: string
) => {
  // Your code
  const videoData: VideoDataModel[] = [];

  try {
    const files = await readdir(filePath);
    const fileProcessingPromises = files.map(async (file) => {
      const fullPath = `${filePath}/${file}`;
      const stats = await stat(fullPath);

      if (!shouldProcessFile(file, stats, searchText)) {
        return;
      }

      if (
        path.extname(file).toLocaleLowerCase() === ".mp4" ||
        stats.isDirectory()
      ) {
        const data = await populateVideoData(file, filePath, stats);
        if (data) {
          videoData.push(data);
        }
      }
    });

    await Promise.all(fileProcessingPromises);

    return videoData.sort((a, b) => {
      // Sort by directory first
      const directoryDifference = Number(b.isDirectory) - Number(a.isDirectory);

      // If both are either directories or files, sort by createdAt
      if (directoryDifference === 0) {
        return b.createdAt! - a.createdAt!;
      }

      return directoryDifference;
    });
  } catch (error) {
    log.error("An error occurred while fetching root video data: ", error);
    throw new Error(
      "An error occurred while fetching root video data." + error
    );
  }
};

export const populateVideoData = async (
  file: string,
  filePath: string,
  stats: Stats
) => {
  try {
    const fullFilePath = `${filePath}/${file}`;
    const jsonFileContents = await readOrDefaultJson(
      `${filePath}/${path.parse(file).name}.json`
    );

    const duration = await calculateDuration(fullFilePath);
    return createVideoDataObject(
      file,
      fullFilePath,
      stats.isDirectory(),
      stats.birthtimeMs,
      filePath,
      duration,
      jsonFileContents
    );
  } catch (error: any) {
    log.error("Error populating video data:", error);
    return null;
  }
};

export const calculateDuration = async (file: string) => {
  let duration = 0;
  if (path.extname(file).toLocaleLowerCase() === ".mp4") {
    const maybeDuration = await getVideoDuration(file);
    if (typeof maybeDuration === "number") {
      duration = maybeDuration;
    }
  }
  return duration;
};

export function getVideoDuration(
  filePath: string
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
  jsonFileContents: VideoDataModel | null
) => ({
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
  currentTime: jsonFileContents?.lastWatched || 0,
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
});

export const createFolderDataObject = (
  basePath: string,
  filePath: string,
  jsonFileContents: VideoDataModel | null,
  tv_show_details: TvShowDetails | null,
  childFolders: { folderPath: string; basename: string }[] = []
) => ({
  basePath,
  filePath,
  season_id: jsonFileContents?.season_id || null,
  tv_show_details,
  childFolders,
  lastVideoPlayed: jsonFileContents?.lastVideoPlayed,
  lastVideoPlayedTime: jsonFileContents?.lastVideoPlayedTime || 0,
  lastVideoPlayedDate: jsonFileContents?.lastVideoPlayedDate || null,
});

export function handleVideoRequest(req: IncomingMessage, res: ServerResponse) {
  const url = new URL(req.url!, `http://${req.headers.host}`);
  const videoPath = decodeURIComponent(url.searchParams.get("path") as string); // Decode the path
  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;
    const file = fs.createReadStream(videoPath, { start, end });
    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunksize,
      "Content-Type": "video/mp4",
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4",
    };

    res.writeHead(200, head);
    fs.createReadStream(videoPath).pipe(res);
  }
}
