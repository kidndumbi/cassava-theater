import { ConversionQueueItem } from "./../../models/conversion-queue-item.model";

export const filterFailed = (queue: ConversionQueueItem[]) =>
  queue.filter((q) => q.status !== "failed");

export const isInMp4ConversionQueue = async (
  filePath: string,
): Promise<boolean> => {
  return (await getConversionQueue()).some(
    (item) => item.inputPath === filePath,
  );
};

export const getConversionQueue = async (includeFailed = false) => {
  const result = await window.mp4ConversionAPI.getConversionQueue();
  return includeFailed ? result : filterFailed(result);
};

export const removeFromConversionQueue = async (id: string) => {
  const result = await window.mp4ConversionAPI.removeFromConversionQueue(id);
  return {
    ...result,
    queue: filterFailed(result.queue),
  };
};

export const pauseConversionItem = async (id: string) => {
  const result = await window.mp4ConversionAPI.pauseConversionItem(id);
  return {
    ...result,
    queue: filterFailed(result.queue),
  };
};

export const unpauseConversionItem = async (id: string) => {
  const result = await window.mp4ConversionAPI.unpauseConversionItem(id);
  return {
    ...result,
    queue: filterFailed(result.queue),
  };
};
