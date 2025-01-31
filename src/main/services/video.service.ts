import { IncomingMessage, ServerResponse } from "http";
import * as fs from "fs";
import { readFile, access } from "fs/promises";
import { stat, readdir } from "fs/promises";
import { Stats } from "fs";
import * as path from "path";
import { VideoDataModel } from "../../models/videoData.model";
import ffmpeg from "fluent-ffmpeg";
import { app } from "electron";
import log from "electron-log/main";

import {
  readThumbnailCache,
  ThumbnailCache,
  writeThumbnailCache,
} from "./thumbnailCache.service";
import { generateThumbnail } from "./thumbnail.service";

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
  console.error("ffprobe.exe does not exist at the resolved path.");
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
}: {
  filePath: string;
  searchText: string | undefined;
  includeThumbnail: boolean;
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

    return updatedVideoData.sort((a, b) =>
      a.fileName!.localeCompare(b.fileName!)
    );
  } catch (error) {
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
    throw new Error("Error fetching video details: " + error);
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
      console.error(
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
    console.error("Error populating video data:", error);
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


export const readJsonData = async (jsonPath: string) => {
  try {
    const exists = await fileExists(jsonPath);
    if (exists) {
      const jsonFile = await readFileData(jsonPath);
      const parsedData = JSON.parse(jsonFile || "");
      return parsedData;
    }
    return null;
  } catch (error) {
    console.error("Error in readJsonData:", error);
    throw error;
  }
};

export function getVideoDuration(
  filePath: string
): Promise<number | "unknown"> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        return reject(err);
      }
      const duration = metadata.format.duration;
      resolve(duration !== undefined ? duration : "unknown");
    });
  });
}

async function readOrDefaultJson(
  filePath: string,
  defaultData: VideoDataModel = { notes: [], overview: {} }
): Promise<VideoDataModel> {
  if (await fileExists(filePath)) {
    const file = await readFileData(filePath);
    return file ? JSON.parse(file) : defaultData;
  }
  return defaultData;
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

export const readFileData = async (
  filePath: string
): Promise<string | undefined> => {
  try {
    const jsonFile = await readFile(filePath);
    return jsonFile?.toString();
  } catch (error) {
    console.log("error::: readFile() ", error);
  }
};

export const fileExists = async (filePath: string): Promise<boolean> => {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
};

export const shouldProcessFile = (
  file: string,
  stats: Stats,
  searchText?: string
) => {
  return searchText &&
    !file.toLowerCase().includes(searchText.toLowerCase()) &&
    !stats.isDirectory()
    ? false
    : true;
};

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
