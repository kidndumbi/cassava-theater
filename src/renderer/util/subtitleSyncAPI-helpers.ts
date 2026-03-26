import { SubtitleSyncQueueItem } from "./../../models/subtitle-sync-queue-item.model";

export const addToSubtitleSyncQueue = async (
  videoPath: string,
  subtitlePath: string,
  options?: { splitPenalty?: number; noSplits?: boolean }
): Promise<{
  success: boolean;
  message: string;
  queue: SubtitleSyncQueueItem[] | null;
}> => {
  if (await isInSubtitleSyncQueue(videoPath, subtitlePath)) {
    return {
      success: false,
      message: "This video-subtitle pair is already in the sync queue.",
      queue: null,
    };
  } else {
    const syncResult =
      await window.subtitleSyncAPI.addToSyncQueue(videoPath, subtitlePath, options);
    return {
      ...syncResult,
      queue: syncResult.queue,
      message: "",
    };
  }
};

export const isInSubtitleSyncQueue = async (
  videoPath: string,
  subtitlePath: string
): Promise<boolean> => {
  const queue = await getSubtitleSyncQueue();
  return queue.some((item) => 
    item.videoPath === videoPath && item.subtitlePath === subtitlePath
  );
};

export const getSubtitleSyncQueue = async (): Promise<SubtitleSyncQueueItem[]> => {
  return await window.subtitleSyncAPI.getSyncQueue();
};

export const removeFromSubtitleSyncQueue = async (id: string) => {
  const result = await window.subtitleSyncAPI.removeFromSyncQueue(id);
  return {
    ...result,
    queue: result.queue,
  };
};

export const pauseSubtitleSyncItem = async (id: string) => {
  const result = await window.subtitleSyncAPI.pauseSyncItem(id);
  return {
    ...result,
    queue: result.queue,
  };
};

export const unpauseSubtitleSyncItem = async (id: string) => {
  const result = await window.subtitleSyncAPI.unpauseSyncItem(id);
  return {
    ...result,
    queue: result.queue,
  };
};