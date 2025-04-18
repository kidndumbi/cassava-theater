import { rendererLoggingService as log } from "../../util/renderer-logging.service";

export const fetchVideoDetailsApi = async ({
  path,
  category,
}: {
  path: string;
  category: string;
}) => {
  try {
    if (!path) {
      log.error("Path is undefined");
      return {};
    }

    const response = window.videoAPI.fetchVideoDetails({ path, category });
    return response;
  } catch (error) {
    log.error("Error fetching video details via API:", error);
    throw error;
  }
};

export const fetchFolderDetailsApi = async (path: string) => {
  try {
    if (!path) {
      log.error("Path is undefined");
      return {};
    }

    const response = await window.videoAPI.fetchFolderDetails({ path });
    return response;
  } catch (error) {
    log.error("Error fetching folder details via API:", error);
    throw error;
  }
};

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
