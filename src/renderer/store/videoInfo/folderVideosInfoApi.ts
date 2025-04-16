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

export const convertToMp4Api = async (path: string) => {
  try {
    if (!path) {
      log.error("Path is undefined");
      return;
    }

    const result = await window.videoAPI.convertToMp4(path);

    return result;
  } catch (error) {
    log.error("Error converting to MP4 via API:", error);
    throw error;
  }
};
