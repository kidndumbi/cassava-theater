import { getFolderFilesApi } from "../store/videoInfo/folderVideosInfoApi";

export const useCommonUtil = () => {
  const getFolderFiles = async (path: string): Promise<string[]> => {
    return await getFolderFilesApi(path);
  };

  return { getFolderFiles };
};
