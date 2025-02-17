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
  readJsonData,
  shouldProcessFile,
  getJsonFilePath,
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
      searchText || "",
      category
    );

    let updatedVideoData: VideoDataModel[];

    if (includeThumbnail) {
      const thumbnailCacheFilePath = path.join(filePath, "thumbnailCache.json");
      const cache = readThumbnailCache(thumbnailCacheFilePath);

      const getVideoThumbnailsPromises = videoData.map((video) =>
        getVideoThumbnails(video, cache)
      );

      updatedVideoData = await Promise.all(getVideoThumbnailsPromises);

      writeThumbnailCache(cache, thumbnailCacheFilePath);
    } else {
      updatedVideoData = videoData;
    }

    const sorted = updatedVideoData.sort((a, b) =>
      (a.fileName ?? "").localeCompare(b.fileName ?? "")
    );

    return filterByCategory(sorted, category);
  } catch (error) {
    log.error("Error fetching video list: ", error);
    throw new Error("Error fetching video list: " + error);
  }
};

export const fetchVideoDetails = async (
  filePath: string,
  category: string
): Promise<VideoDataModel> => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Path does not exist: ${filePath}`);
  }

  try {
    const jsonFilePath = filePath.replace(/\.(mp4|mkv)$/i, ".json");
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
      jsonFileContents,
      category
    );

    const thumbnailCacheFilePath = path.join(
      path.dirname(filePath),
      "thumbnailCache.json"
    );
    const cache = readThumbnailCache(thumbnailCacheFilePath);
    const processedVideoData = await getVideoThumbnails(videoDetails, cache);

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

export const saveCurrentTime = async (
  event: Electron.IpcMainInvokeEvent,
  {
    currentVideo,
    currentTime,
    isEpisode,
  }: { currentVideo: VideoDataModel; currentTime: number; isEpisode?: boolean }
) => {
  try {
    if (!currentVideo.filePath) {
      throw new Error("currentVideo.filePath is undefined");
    }
    const jsonFilePath = getJsonFilePath(currentVideo.filePath);

    const jsonFileContents = await readJsonData(jsonFilePath);
    jsonFileContents.currentTime = currentTime;
    jsonFileContents.watched = currentTime !== 0;
    jsonFileContents.lastVideoPlayedDate = new Date().toISOString();

    await writeJsonToFile(jsonFilePath, jsonFileContents);

    if (isEpisode) {
      if (!currentVideo.filePath) {
        throw new Error("currentVideo.filePath is undefined");
      }
      const parentFilePath = path.dirname(currentVideo.filePath);
      const grandParentFilePath = path.dirname(parentFilePath);
      const grandParentJsonFilePath = getJsonFilePath(grandParentFilePath);

      const grandParentJsonFileContents = await readJsonData(
        grandParentJsonFilePath
      );
      grandParentJsonFileContents.lastVideoPlayed = currentVideo.filePath;
      grandParentJsonFileContents.lastVideoPlayedTime = currentTime;
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
      log.error("save:saveLCurrentTime error ", error);
    } else {
      log.error("An unknown error occurred:", error);
    }
  }
};

export const getVideoJsonData = async (
  event: Electron.IpcMainInvokeEvent,
  currentVideo: VideoDataModel
) => {
  try {
    const EMPTY_JSON_RESPONSE: VideoDataModel = { notes: [], overview: {} };

    if (!currentVideo || !currentVideo.filePath) {
      console.warn(
        "Warning: Received undefined or invalid currentVideo.filepath."
      );
      return EMPTY_JSON_RESPONSE;
    }

    const newFilePath = currentVideo.filePath.replace(/\.(mp4|mkv)$/i, ".json");

    return (await readJsonData(newFilePath)) as VideoDataModel;
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
  }: { currentVideo: VideoDataModel; newVideoJsonData: VideoDataModel }
) => {
  try {
    const newFilePath = getJsonFilePath(currentVideo.filePath || "");
    const existingData = await readJsonData(newFilePath, {} as VideoDataModel);
    const mergedData = {
      ...existingData,
      ...newVideoJsonData,
    } as VideoDataModel;
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

async function getVideoThumbnails(
  video: VideoDataModel,
  cache: ThumbnailCache
): Promise<VideoDataModel> {
  if (!video.isDirectory) {
    if (!video.filePath) {
      throw new Error("Video file path is undefined");
    }
    const cacheKey = video.filePath;
    let videoProgressScreenshot = cache[cacheKey]?.image;

    const thumbnailPromise =
      !videoProgressScreenshot ||
      cache[cacheKey].currentTime !== (video.currentTime ?? 30)
        ? video.filePath
          ? generateThumbnail(video.filePath, video.currentTime ?? 30, ffmpeg)
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
  event: Electron.IpcMainInvokeEvent,
  filePath: string,
  searchText: string,
  category: string
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
        [".mp4", ".mkv"].includes(path.extname(file).toLowerCase()) ||
        stats.isDirectory()
      ) {
        const data = await populateVideoData(file, filePath, stats, category);
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
        if (b.createdAt !== undefined && a.createdAt !== undefined) {
          return b.createdAt - a.createdAt;
        }
        return 0;
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
  stats: Stats,
  category: string
) => {
  try {
    const fullFilePath = `${filePath}/${file}`;
    const jsonFileContents = await readJsonData(
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
      jsonFileContents,
      category
    );
  } catch (error: unknown) {
    log.error("Error populating video data:", error);
    return null;
  }
};

export const calculateDuration = async (file: string) => {
  let duration = 0;

  const ext = path.extname(file).toLowerCase();
  if ([".mp4", ".mkv"].includes(ext)) {
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
  jsonFileContents: VideoDataModel | null,
  category?: string
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
  childFolders: { folderPath: string; basename: string }[] = []
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

export function handleVideoRequest(req: IncomingMessage, res: ServerResponse) {
  if (!req.url) {
    res.writeHead(400, { "Content-Type": "text/plain" });
    res.end("Bad Request: URL is missing.");
    return;
  }
  const url = new URL(req.url, `http://${req.headers.host}`);
  const videoPath = decodeURIComponent(url.searchParams.get("path") as string);
  const fileExt = path.extname(videoPath).toLowerCase();

  if (fileExt === ".mkv") {
    // Optional: extract start time from query parameter (in seconds)
    const startParam = url.searchParams.get("start");
    const startTime = startParam ? Number(startParam) : 0;

    console.log("startTime:: ", startTime);

    if (!fs.existsSync(videoPath)) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("MKV file not found.");
      return;
    }

    res.writeHead(200, { "Content-Type": "video/mp4" });
    const command = ffmpeg(videoPath)
      // Use -ss input option if startTime specified
      .inputOptions(startTime > 0 ? [`-ss ${startTime}`] : [])
      .videoCodec("libx264")
      .audioCodec("aac")
      .format("mp4")
      .outputOptions("-movflags frag_keyframe+empty_moov");

    command
      .on("error", (err) => {
        console.error("FFmpeg error:", err);
        if (!res.headersSent) {
          res.writeHead(500, { "Content-Type": "text/plain" });
        }
        res.end("Error processing MKV to MP4 stream.");
      })
      .pipe(res, { end: true });
    return;
  }

  // Otherwise (e.g. MP4 case), use your existing partial-content logic
  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunkSize = end - start + 1;

    const fileStream = fs.createReadStream(videoPath, { start, end });
    const head = {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": chunkSize,
      "Content-Type": "video/mp4",
    };

    res.writeHead(206, head);
    fileStream.pipe(res);
  } else {
    const head = {
      "Content-Length": fileSize,
      "Content-Type": "video/mp4",
    };
    res.writeHead(200, head);
    fs.createReadStream(videoPath).pipe(res);
  }
}
