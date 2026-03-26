import { levelDBService, KeyType } from "./levelDB.service";
import { SubtitleSyncQueueItem } from "../../models/subtitle-sync-queue-item.model";

const COLLECTION_NAME = "subtitleSyncQueueItems";

export const putSubtitleSyncQueueItem = async (
  key: KeyType,
  value: Partial<SubtitleSyncQueueItem>,
): Promise<SubtitleSyncQueueItem> => {
  const existing = (await getSubtitleSyncQueueItem(key)) || {};

  // If queueIndex is not provided, assign the next available index
  let queueIndex = value.queueIndex;
  if (queueIndex === undefined) {
    const allItems = await getAllSubtitleSyncQueueItems();
    queueIndex =
      allItems.length > 0
        ? Math.max(...allItems.map((item) => item.queueIndex ?? 0)) + 1
        : 0;
  }

  const newItem: SubtitleSyncQueueItem = {
    ...existing,
    ...value,
    queueIndex,
  };

  await levelDBService.put(COLLECTION_NAME, key, newItem);
  return newItem;
};

export const getSubtitleSyncQueueItem = (
  key: KeyType,
): Promise<SubtitleSyncQueueItem | null> => {
  return levelDBService.get(COLLECTION_NAME, key);
};

export const deleteSubtitleSyncQueueItem = (key: KeyType): Promise<void> => {
  return levelDBService.delete(COLLECTION_NAME, key);
};

export const getAllSubtitleSyncQueueItems = async (): Promise<SubtitleSyncQueueItem[]> => {
  const items = await levelDBService.getAll(COLLECTION_NAME);
  return items.sort((a, b) => (a.queueIndex ?? 0) - (b.queueIndex ?? 0));
};

export const deleteAllSubtitleSyncQueueItems = (): Promise<void> => {
  return levelDBService.clearCollection(COLLECTION_NAME);
};