import { TvShowDetails } from "../../models/tv-show-details.model";
import { VideoDataModel } from "../../models/videoData.model";
import { rendererLoggingService as log } from "../util/renderer-logging.service";

export async function fetchVideoData({
  filePath,
  searchText,
  includeThumbnail = false,
  category,
}: {
  filePath: string;
  searchText?: string;
  includeThumbnail?: boolean;
  category: string;
}): Promise<VideoDataModel[]> {
  if (!filePath) return [];
  const result = window.videoAPI.fetchVideoData({
    filePath,
    searchText,
    includeThumbnail,
    category,
  });

  return result;
}

export async function fetchVideoDetails({
  path,
  category,
}: {
  path: string;
  category: string;
}): Promise<VideoDataModel | null> {
  if (!path) return null;
  return window.videoAPI.fetchVideoDetails({ path, category });
}

export async function fetchFolderDetails(
  path: string,
): Promise<VideoDataModel | null> {
  if (!path) return null;
  return window.videoAPI.fetchFolderDetails({ path });
}

export async function updateVideoData({
  currentVideo,
  newVideoJsonData,
}: {
  currentVideo: VideoDataModel | undefined;
  newVideoJsonData: VideoDataModel | undefined;
}) {
  return window.videoAPI.saveVideoJsonData({
    currentVideo,
    newVideoJsonData,
  });
}

export async function addTvShowFolder({
  tvShowName,
  subfolders,
  tvShowDetails,
  tvShowsFolderPath,
  poster,
  backdrop,
}: {
  tvShowName: string;
  subfolders: string[];
  tvShowDetails: TvShowDetails;
  tvShowsFolderPath: string;
  poster: string;
  backdrop: string;
}) {
  return window.videoAPI.AddTvShowFolder({
    tvShowName,
    subfolders,
    tvShowDetails,
    tvShowsFolderPath,
    poster,
    backdrop,
  });
}

export const convertSrtToVtt = async (srt: string) => {
  try {
    return await window.fileManagerAPI.convertSrtToVtt(srt);
  } catch (error) {
    log.error("Error converting SRT to VTT:", error);
    throw error;
  }
};

export const getFolderFilesApi = async (path: string) => {
  try {
    if (!path) {
      log.error("Path is undefined");
      return [];
    }

    const response = await window.videoAPI.getFolderFiles(path);
    return response;
  } catch (error) {
    log.error("Error fetching folder files via API:", error);
    throw error;
  }
};

export const getScreenshotApi = async (videodata: VideoDataModel) => {
  try {
    const response = await window.videoAPI.getScreenshot(videodata);
    return response;
  } catch (error) {
    log.error("Error fetching screenshot via API:", error);
    throw error;
  }
};

// Add more API wrappers as needed for TanStack Query usage.

export async function fetchRecentlyWatchedVideosData(args: { videoType: "movies" | "tvShows"; limit?: number }) {
  try {
    return await window.videoAPI.fetchRecentlyWatchedVideosData(args);
  } catch (error) {
    log.error("Error fetching recently watched videos data:", error);
    throw error;
  }
}
