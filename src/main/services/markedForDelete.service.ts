import { levelDBService, KeyType } from "./levelDB.service";

/**
 * Add a file path to the markedForDelete collection.
 */
export const addMarkedForDelete = async (filePath: string): Promise<void> => {
  await levelDBService.put("markedForDelete", filePath, filePath);
};

/**
 * Remove a file path from the markedForDelete collection.
 */
export const removeMarkedForDelete = async (filePath: string): Promise<void> => {
  await levelDBService.delete("markedForDelete", filePath);
};

/**
 * Get all file paths marked for deletion.
 */
export const getAllMarkedForDelete = async (): Promise<string[]> => {
  return await levelDBService.getAll("markedForDelete");
};

/**
 * Check if a file path is marked for deletion.
 */
export const isMarkedForDelete = async (filePath: string): Promise<boolean> => {
  const result = await levelDBService.get("markedForDelete", filePath);
  return !!result;
};
