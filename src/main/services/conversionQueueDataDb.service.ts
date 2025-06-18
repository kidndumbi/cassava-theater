import { levelDBService, KeyType } from "./levelDB.service";
import { ConversionQueueItem } from "../../models/conversion-queue-item.model";

const COLLECTION_NAME = "converQueueItems";

export const putQueueItem = async (
  key: KeyType,
  value: Partial<ConversionQueueItem>,
): Promise<void> => {
  const existing = (await getQueueItem(key)) || {};
  return levelDBService.put(COLLECTION_NAME, key, { ...existing, ...value });
};

export const getQueueItem = (
  key: KeyType,
): Promise<ConversionQueueItem | null> => {
  return levelDBService.get(COLLECTION_NAME, key);
};

export const deleteQueueItem = (key: KeyType): Promise<void> => {
  return levelDBService.delete(COLLECTION_NAME, key);
};

export const getAllQueueItems = (): Promise<ConversionQueueItem[]> => {
  return levelDBService.getAll(COLLECTION_NAME);
};

export const deleteAllQueueItems = (): Promise<void> => {
  return levelDBService.clearCollection(COLLECTION_NAME);
};
