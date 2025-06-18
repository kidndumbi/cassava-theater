import { levelDBService, KeyType } from "./levelDB.service";
import { ConversionQueueItem } from "../../models/conversion-queue-item.model";

const COLLECTION_NAME = "converQueueItems";

export const putQueueItem = async (
  key: KeyType,
  value: Partial<ConversionQueueItem>,
): Promise<ConversionQueueItem> => {
  const existing = (await getQueueItem(key)) || {};

  // If queueIndex is not provided, assign the next available index
  let queueIndex = value.queueIndex;
  if (queueIndex === undefined) {
    const allItems = await getAllQueueItems();
    queueIndex =
      allItems.length > 0
        ? Math.max(...allItems.map((item) => item.queueIndex ?? 0)) + 1
        : 0;
  }

  const newItem: ConversionQueueItem = {
    ...existing,
    ...value,
    queueIndex,
  };

  await levelDBService.put(COLLECTION_NAME, key, newItem);
  return newItem;
};

export const getQueueItem = (
  key: KeyType,
): Promise<ConversionQueueItem | null> => {
  return levelDBService.get(COLLECTION_NAME, key);
};

export const deleteQueueItem = (key: KeyType): Promise<void> => {
  return levelDBService.delete(COLLECTION_NAME, key);
};

export const getAllQueueItems = async (): Promise<ConversionQueueItem[]> => {
  const items = await levelDBService.getAll(COLLECTION_NAME);
  return items.sort((a, b) => (a.queueIndex ?? 0) - (b.queueIndex ?? 0));
};

export const deleteAllQueueItems = (): Promise<void> => {
  return levelDBService.clearCollection(COLLECTION_NAME);
};
