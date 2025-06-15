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

export const removeFromConversionQueue = async (filePath: string) => {
  const result =
    await window.mp4ConversionAPI.removeFromConversionQueue(filePath);
  return {
    ...result,
    queue: filterFailed(result.queue),
  };
};

export const pauseConversionItem = async (filePath: string) => {
  const result = await window.mp4ConversionAPI.pauseConversionItem(filePath);
  return {
    ...result,
    queue: filterFailed(result.queue),
  };
};

export const unpauseConversionItem = async (filePath: string) => {
  const result = await window.mp4ConversionAPI.unpauseConversionItem(filePath);
  return {
    ...result,
    queue: filterFailed(result.queue),
  };
};
