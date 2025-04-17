import { rendererLoggingService as log } from "../../util/renderer-logging.service";

export const addToConversionQueueApi = async (path: string) => {
  try {
    if (!path) {
      log.error("Path is undefined");
      return;
    }

    const result = await window.videoAPI.addToConversionQueue(path);

    return result;
  } catch (error) {
    log.error("Error converting to MP4 via API:", error);
    throw error;
  }
};
