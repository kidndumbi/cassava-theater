import { levelDBService, KeyType } from "./levelDB.service";
import { SubtitleGenerationQueueItem } from "../../models/subtitle-generation-queue-item.model";

const COLLECTION_NAME = "subtitleQueueItems";

export const putSubtitleQueueItem = async (
  key: KeyType,
  value: Partial<SubtitleGenerationQueueItem>,
): Promise<SubtitleGenerationQueueItem> => {
  const existing = (await getSubtitleQueueItem(key)) || {};

  // If queueIndex is not provided, assign the next available index
  let queueIndex = value.queueIndex;
  if (queueIndex === undefined) {
    const allItems = await getAllSubtitleQueueItems();
    queueIndex =
      allItems.length > 0
        ? Math.max(...allItems.map((item) => item.queueIndex ?? 0)) + 1
        : 0;
  }

  const newItem: SubtitleGenerationQueueItem = {
    ...existing,
    ...value,
    queueIndex,
  };

  await levelDBService.put(COLLECTION_NAME, key, newItem);
  return newItem;
};

export const getSubtitleQueueItem = (
  key: KeyType,
): Promise<SubtitleGenerationQueueItem | null> => {
  return levelDBService.get(COLLECTION_NAME, key);
};

export const deleteSubtitleQueueItem = (key: KeyType): Promise<void> => {
  return levelDBService.delete(COLLECTION_NAME, key);
};

export const getAllSubtitleQueueItems = async (): Promise<SubtitleGenerationQueueItem[]> => {
  const items = await levelDBService.getAll(COLLECTION_NAME);
  return items.sort((a, b) => (a.queueIndex ?? 0) - (b.queueIndex ?? 0));
};

export const deleteAllSubtitleQueueItems = (): Promise<void> => {
  return levelDBService.clearCollection(COLLECTION_NAME);
};