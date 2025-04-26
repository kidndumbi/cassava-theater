import { getFolderFilesApi } from "../api/videoData.api";

export const useCommonUtil = () => {
  const getFolderFiles = async (path: string): Promise<string[]> => {
    return await getFolderFilesApi(path);
  };

  return { getFolderFiles };
};
