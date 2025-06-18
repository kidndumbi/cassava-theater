import { ConversionQueueItem } from "./../../models/conversion-queue-item.model";

export const addToConversionQueue = async (
  inputPath: string,
): Promise<{
  success: boolean;
  message: string;
  queue: ConversionQueueItem[] | null;
}> => {
  if (await isInMp4ConversionQueue(inputPath)) {
    return {
      success: false,
      message: "File is already in the conversion queue.",
      queue: null,
    };
  } else {
    const conversionResult =
      await window.mp4ConversionAPI.addToConversionQueue(inputPath);
    return {
      ...conversionResult,
      queue: conversionResult.queue,
      message: "",
    };
  }
};

export const isInMp4ConversionQueue = async (
  filePath: string,
): Promise<boolean> => {
  const queue = await getConversionQueue();
  return queue.some((item) => item.inputPath === filePath);
};

export const getConversionQueue = async () => {
  return await window.mp4ConversionAPI.getConversionQueue();
};

export const removeFromConversionQueue = async (id: string) => {
  const result = await window.mp4ConversionAPI.removeFromConversionQueue(id);
  return {
    ...result,
    queue: result.queue,
  };
};

export const pauseConversionItem = async (id: string) => {
  const result = await window.mp4ConversionAPI.pauseConversionItem(id);
  return {
    ...result,
    queue: result.queue,
  };
};

export const unpauseConversionItem = async (id: string) => {
  const result = await window.mp4ConversionAPI.unpauseConversionItem(id);
  return {
    ...result,
    queue: result.queue,
  };
};
