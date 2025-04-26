import { VideoDataModel } from "../../models/videoData.model";
import { getFolderFilesApi, getScreenshotApi } from "../api/videoData.api";

export const useCommonUtil = () => {
  const getFolderFiles = async (path: string): Promise<string[]> => {
    return await getFolderFilesApi(path);
  };

  const getScreenshot = async (videodata: VideoDataModel) => {
    return await getScreenshotApi(videodata);
  };

  return { getFolderFiles, getScreenshot };
};
