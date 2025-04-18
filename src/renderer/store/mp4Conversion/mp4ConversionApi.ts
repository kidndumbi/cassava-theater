import { rendererLoggingService as log } from "../../util/renderer-logging.service";

const callPathApi = async <T>(apiMethod: (path: string) => Promise<T>, errorMsg: string, path: string): Promise<T | undefined> => {
  try {
    if (!path) {
      log.error("Path is undefined");
      return;
    }
    const result = await apiMethod(path);
    return result;
  } catch (error) {
    log.error(errorMsg, error);
    throw error;
  }
};

export const addToConversionQueueApi = async (path: string) =>
  callPathApi(window.mp4ConversionAPI.addToConversionQueue, "Error converting to MP4 via API:", path);

export const pauseConversionItemApi = async (path: string) =>
  callPathApi(window.mp4ConversionAPI.pauseConversionItem, "Error pausing conversion item via API:", path);

export const unpauseConversionItemApi = async (path: string) =>
  callPathApi(window.mp4ConversionAPI.unpauseConversionItem, "Error unpausing conversion item via API:", path);

export const isItemPausedApi = async (path: string) =>
  callPathApi(window.mp4ConversionAPI.isItemPaused, "Error checking if item is paused via API:", path);

export const getCurrentProcessingItemApi = async () => {
  try {
    const result = await window.mp4ConversionAPI.getCurrentProcessingItem();
    return result;
  } catch (error) {
    log.error("Error getting current processing item via API:", error);
    throw error;
  }
};

export const getConversionQueueApi = async () => {
  try {
    const result = await window.mp4ConversionAPI.getConversionQueue();
    return result;
  } catch (error) {
    log.error("Error getting conversion queue via API:", error);
    throw error;
  }
};
