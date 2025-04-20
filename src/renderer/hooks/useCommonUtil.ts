import { getScreenshotApi, getFolderFilesApi } from "../store/videoInfo/folderVideosInfoApi";
import { VideoDataModel } from "../../models/videoData.model";

export const useCommonUtil = () => {
  const getFolderFiles = async (path: string): Promise<string[]> => {
    return await getFolderFilesApi(path);
  };

  const getScreenshot = async (videodata: VideoDataModel) => {
    return await getScreenshotApi(videodata);
  };

  return { getFolderFiles, getScreenshot };
};
