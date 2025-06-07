import { ConversionQueueItem } from "./../../models/conversion-queue-item.model";

export const isInMp4ConversionQueue = async (
  filePath: string,
): Promise<boolean> => {
  const conversionQueue: ConversionQueueItem[] =
    await window.mp4ConversionAPI.getConversionQueue();
  return conversionQueue.some(
    (item) => item.inputPath === filePath && item.status !== "failed",
  );
};
