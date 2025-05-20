import { TvShowDetails } from "./../../models/tv-show-details.model";
import * as fs from "fs";
import { stat } from "fs/promises";
import * as path from "path";
import { VideoDataModel } from "../../models/videoData.model";
import { loggingService as log } from "./main-logging.service";
import * as videoDbDataService from "./videoDbData.service";
import * as settingsDataDbService from "../services/settingsDataDb.service";

import * as videoDataHelpers from "./video.helpers";
import { getMovieOrTvShowById } from "./themoviedb.service";
import { normalizeFilePath } from "./helpers";

export const fetchWatchlaterVideos = async (): Promise<VideoDataModel[]> => {
  const moviesFilePath =
    await settingsDataDbService.getSetting("movieFolderPath");
  if (!moviesFilePath) throw new Error("Path is required");

  // Get watchlaters from main movie folder
  const videosData = await fetchVideosData({
    filePath: moviesFilePath,
    includeThumbnail: false,
    category: "movies",
  });
  const mainWatchlaters = videosData.filter(video => video.watchLater);

  // Get watchlaters from all custom folders
  const customFolders = await settingsDataDbService.getSetting("folders");
  const customWatchlaters: VideoDataModel[] = [];
  if (Array.isArray(customFolders)) {
    for (const folder of customFolders) {
      const folderPath = folder.folderPath;
      if (!folderPath || !fs.existsSync(folderPath)) continue;
      try {
        const folderVideos = await fetchVideosData({
          filePath: folderPath,
          includeThumbnail: false,
          category: "movies",
        });
        customWatchlaters.push(...folderVideos.filter(video => video.watchLater));
      } catch (e) {
        log.error("Error fetching watchlater videos from custom folder: ", e);
      }
    }
  }

  return [...mainWatchlaters, ...customWatchlaters];
};

export const fetchRecentlyWatchedCustomVideosData = async (
  limit = 20,
): Promise<
  {
    folder: {
      id: string;
      name: string;
      folderPath: string;
    };
    videos: VideoDataModel[];
  }[]
> => {
  const customFolders = await settingsDataDbService.getSetting("folders");
  if (!Array.isArray(customFolders)) return [];

  const results: {
    folder: { id: string; name: string; folderPath: string };
    videos: VideoDataModel[];
  }[] = [];

  for (const folder of customFolders) {
    const folderPath = folder.folderPath;
    if (!folderPath || !fs.existsSync(folderPath)) continue;

    try {
      const videosData = await fetchVideosData({
        filePath: folderPath,
        includeThumbnail: false,
        category: "movies",
      });

      const filtered = videosData
        .filter((v) => v.lastVideoPlayedDate && (v.currentTime || 0) > 1)
        .sort(
          (a, b) =>
            new Date(b.lastVideoPlayedDate ?? 0).getTime() -
            new Date(a.lastVideoPlayedDate ?? 0).getTime(),
        )
        .slice(0, limit);

      results.push({
        folder: {
          id: folder.id,
          name: folder.name,
          folderPath,
        },
        videos: filtered,
      });
    } catch (e) {
      log.error("Error fetching custom folder videos: ", e);
    }
  }

  return results;
};

export const fetchRecentlyWatchedVideosData = async (
  videoType: "movies" | "tvShows",
  limit = 20,
): Promise<VideoDataModel[]> => {
  try {
    const filePath =
      videoType === "movies"
        ? await settingsDataDbService.getSetting("movieFolderPath")
        : await settingsDataDbService.getSetting("tvShowsFolderPath");

    if (!filePath) {
      throw new Error("Path is required");
    }

    const videosData = await fetchVideosData({
      filePath,
      includeThumbnail: false,
      category: videoType,
    });

    let filtered: VideoDataModel[];
    if (videoType === "movies") {
      filtered = videosData
        .filter((m) => m.lastVideoPlayedDate && (m.currentTime || 0) > 1)
        .sort(
          (a, b) =>
            new Date(b.lastVideoPlayedDate ?? 0).getTime() -
            new Date(a.lastVideoPlayedDate ?? 0).getTime(),
        )
        .slice(0, limit);
    } else {
      filtered = videosData
        .filter((m) => !!m.lastVideoPlayed && !!m.lastVideoPlayedDate)
        .sort(
          (a, b) =>
            new Date(b.lastVideoPlayedDate ?? 0).getTime() -
            new Date(a.lastVideoPlayedDate ?? 0).getTime(),
        )
        .slice(0, limit);
    }

    return filtered;
  } catch (error) {
    log.error("Error fetching sorted video list: ", error);
    throw new Error("Error fetching sorted video list: " + error);
  }
};

export const fetchVideosData = async ({
  filePath,
  includeThumbnail,
  category,
}: {
  filePath: string;
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
    const videoData: VideoDataModel[] = await videoDataHelpers.getRootVideoData(
      null,
      filePath,
      category,
    );

    let updatedVideoData: VideoDataModel[];

    if (includeThumbnail) {
      const getVideoThumbnailsPromises = videoData.map((video) =>
        videoDataHelpers.getVideoThumbnail(video, video.duration),
      );

      updatedVideoData = await Promise.all(getVideoThumbnailsPromises);
    } else {
      updatedVideoData = videoData;
    }

    const sorted = updatedVideoData.sort((a, b) =>
      (a.fileName ?? "").localeCompare(b.fileName ?? "", undefined, {
        numeric: true,
        sensitivity: "base",
      }),
    );

    return videoDataHelpers.filterByCategory(sorted, category);
  } catch (error) {
    log.error("Error fetching video list: ", error);
    throw new Error("Error fetching video list: " + error);
  }
};

export const AddTvShowFolder = async (data: {
  tvShowName: string;
  subfolders: string[];
  tvShowDetails: TvShowDetails | null;
  tvShowsFolderPath: string;
  poster: string;
  backdrop: string;
}): Promise<VideoDataModel> => {
  const {
    tvShowName,
    subfolders,
    tvShowDetails,
    tvShowsFolderPath,
    poster,
    backdrop,
  } = data;

  if (!fs.existsSync(tvShowsFolderPath)) {
    throw new Error(`Path does not exist: ${tvShowsFolderPath}`);
  }

  try {
    const tvShowFolderPath = path.join(tvShowsFolderPath, tvShowName);
    if (!fs.existsSync(tvShowFolderPath)) {
      fs.mkdirSync(tvShowFolderPath, { recursive: true });
    }

    for (const subfolder of subfolders) {
      const subfolderPath = path.join(tvShowFolderPath, subfolder);
      if (!fs.existsSync(subfolderPath)) {
        fs.mkdirSync(subfolderPath, { recursive: true });
      }
    }

    await saveVideoJsonData(null, {
      currentVideo: { filePath: tvShowFolderPath } as VideoDataModel,
      newVideoJsonData: {
        tv_show_details: tvShowDetails,
        poster,
        backdrop,
      } as VideoDataModel,
    });

    const stats = await stat(tvShowFolderPath);

    const videoData = await videoDataHelpers.populateVideoData(
      tvShowName,
      tvShowsFolderPath,
      stats,
      "tvShows",
    );

    return videoData;
  } catch (error) {
    log.error("Error adding TV show folder: ", error);
    throw new Error("Error adding TV show folder: " + error);
  }
};

export const getFolderFiles = (folderPath: string): string[] => {
  if (!fs.existsSync(folderPath)) {
    throw new Error(`Path does not exist: ${folderPath}`);
  }
  const entries = fs.readdirSync(folderPath);
  return entries
    .map((entry) => normalizeFilePath(path.join(folderPath, entry)))
    .filter((fullPath) => fs.statSync(fullPath).isFile());
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
    const videoDbData = await videoDbDataService.getVideo(
      normalizeFilePath(filePath),
    );
    const duration =
      videoDbData?.duration > 0
        ? videoDbData.duration
        : await videoDataHelpers.calculateDuration(filePath);
    const fileName = path.basename(filePath);

    const videoDetails: VideoDataModel = videoDataHelpers.createVideoDataObject(
      fileName,
      filePath,
      false,
      stats.birthtimeMs,
      "",
      duration,
      videoDbData,
      category,
    );

    if (videoDetails?.movie_details && !videoDetails?.movie_details.credits) {
      const movie_details = await getMovieOrTvShowById(
        videoDetails?.movie_details.id.toString(),
        "movie",
      );

      await videoDbDataService.putVideo(
        normalizeFilePath(videoDetails.filePath),
        {
          movie_details,
        },
      );
      videoDetails.movie_details = movie_details;
    }

    const processedVideoData = await videoDataHelpers.getVideoThumbnail(
      videoDetails,
      duration,
    );

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
    const videoDbData = await videoDbDataService.getVideo(
      normalizeFilePath(dirPath),
    );
    const basename = path.basename(dirPath);

    const sortedChildFolders =
      await videoDataHelpers.getSortedChildFolders(dirPath);

    const videoDetails: VideoDataModel =
      videoDataHelpers.createFolderDataObject(
        basename,
        dirPath,
        videoDbData,
        videoDbData?.tv_show_details,
        sortedChildFolders,
      );

    if (
      videoDetails?.tv_show_details &&
      !videoDetails?.tv_show_details.aggregate_credits
    ) {
      const tv_show_details = (await getMovieOrTvShowById(
        videoDetails?.tv_show_details.id.toString(),
        "tv",
      )) as TvShowDetails;

      await videoDbDataService.putVideo(
        normalizeFilePath(videoDetails.filePath),
        {
          tv_show_details: tv_show_details,
        },
      );
    }

    return videoDetails;
  } catch (error) {
    log.error("Error fetching Folder details: ", error);
    throw new Error("Error fetching Folder details: " + error);
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

    return await videoDbDataService.getVideo(
      normalizeFilePath(currentVideo.filePath),
    );
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
  const newFilePath = currentVideo.filePath || "";

  const handleError = (error: unknown) => {
    if (error instanceof Error) {
      console.error("An error occurred:", error.message);
    } else {
      console.error("An unknown error occurred:", error);
    }
    throw new Error("Failed to save video JSON data");
  };

  try {
    if (newVideoJsonData && newVideoJsonData.videoProgressScreenshot) {
      newVideoJsonData.videoProgressScreenshot = null;
    }
    await videoDbDataService.putVideo(
      normalizeFilePath(newFilePath),
      newVideoJsonData,
    );
    const videoDbData = await videoDbDataService.getVideo(
      normalizeFilePath(newFilePath),
    );
    return videoDbData;
  } catch (error) {
    handleError(error);
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

    currentVideo.videoProgressScreenshot = null;

    let videoDbData = await videoDbDataService.getVideo(
      normalizeFilePath(currentVideo.filePath),
    );

    if (!videoDbData) {
      videoDbData = currentVideo;
    }

    videoDbData.currentTime = currentTime;
    videoDbData.watched = currentTime !== 0;
    videoDbData.lastVideoPlayedDate = new Date().toISOString();

    videoDbDataService.putVideo(
      normalizeFilePath(currentVideo.filePath),
      videoDbData,
    );

    let parentCurrentTimeData = {};

    if (isEpisode) {
      parentCurrentTimeData = await videoDataHelpers.updateParentVideoData(
        currentVideo,
        currentTime,
      );
    }

    return { ...videoDbData, ...parentCurrentTimeData };
  } catch (error: unknown) {
    if (error instanceof Error) {
      log.error("save:saveCurrentTime error ", error);
    } else {
      log.error("An unknown error occurred:", error);
    }
  }
};
