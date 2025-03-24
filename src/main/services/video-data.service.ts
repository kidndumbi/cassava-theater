import * as fs from "fs";
import { stat } from "fs/promises";
import * as path from "path";
import { VideoDataModel } from "../../models/videoData.model";
import { loggingService as log } from "./main-logging.service";

import * as videoDataHelpers from "./video.helpers";
import { getMovieOrTvShowById } from "./themoviedb.service";
import { getValue } from "../store";

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
    const videoData: VideoDataModel[] = await videoDataHelpers.getRootVideoData(
      null,
      filePath,
      searchText || "",
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
    const duration = await videoDataHelpers.calculateDuration(filePath);
    const fileName = path.basename(filePath);

    const videoDetails: VideoDataModel = videoDataHelpers.createVideoDataObject(
      fileName,
      filePath,
      false,
      stats.birthtimeMs,
      "",
      duration,
      jsonFileContents,
      category,
    );

    if (videoDetails?.movie_details && !videoDetails?.movie_details.credits) {
      const movie_details = await getMovieOrTvShowById(
        videoDetails?.movie_details.id.toString(),
        "movie",
        getValue("theMovieDbApiKey"), // Correctly typed key
      );

      const existingData = await videoDataHelpers.readJsonData(
        videoDetails.filePath,
        {} as VideoDataModel,
      );

      const mergedData = {
        ...existingData,
        movie_details,
      } as VideoDataModel;

      await videoDataHelpers.writeJsonToFile(videoDetails.filePath, mergedData);
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

    const videoDetails: VideoDataModel =
      videoDataHelpers.createFolderDataObject(
        basename,
        dirPath,
        jsonFileContents,
        jsonFileContents?.tv_show_details,
        childFolders,
      );

    if (
      videoDetails?.tv_show_details &&
      !videoDetails?.tv_show_details.aggregate_credits
    ) {
      const tv_show_details = await getMovieOrTvShowById(
        videoDetails?.tv_show_details.id.toString(),
        "tv",
        getValue("theMovieDbApiKey"), // Correctly typed key
      );
      //console.log("credits", tv_show_details);
      const existingData = await videoDataHelpers.readJsonData(
        videoDetails.filePath,
        {} as VideoDataModel,
      );

      const mergedData = {
        ...existingData,
        tv_show_details,
      } as VideoDataModel;

      await videoDataHelpers.writeJsonToFile(videoDetails.filePath, mergedData);
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

    const jsonFileContents = await videoDataHelpers.updateVideoData(
      currentVideo.filePath,
      currentTime,
    );
    await videoDataHelpers.writeJsonToFile(
      currentVideo.filePath,
      jsonFileContents,
    );

    if (isEpisode) {
      await videoDataHelpers.updateParentVideoData(currentVideo, currentTime);
    }

    return jsonFileContents;
  } catch (error: unknown) {
    if (error instanceof Error) {
      log.error("save:saveCurrentTime error ", error);
    } else {
      log.error("An unknown error occurred:", error);
    }
  }
};
