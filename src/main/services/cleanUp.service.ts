import * as helpers from "./helpers";
import { loggingService as log } from "./main-logging.service";
import fsPromise from "fs/promises";

/**
 * Reads and parses the marked-for-deletion file.
 * @param markedFilePath Path to the marked-for-deletion file.
 * @returns List of file paths marked for deletion.
 */
const readDeletionList = async (markedFilePath: string): Promise<string[]> => {
  try {
    const content = await helpers.readFileDataAsync(markedFilePath);
    return JSON.parse(content);
  } catch (error) {
    log.error("Error processing deletion list:", error);
    throw error; // Propagate the error to handle it in the calling function.
  }
};

/**
 * Deletes a file or folder and handles errors.
 * @param filePath Path to the file or folder to delete.
 * @returns True if deletion was successful, false otherwise.
 */
const deleteFileSafely = async (filePath: string): Promise<boolean> => {
  try {
    const { isFile } = await helpers.getFileInfo(filePath);
    if (await helpers.fileExists(filePath)) {
      await helpers.deleteFileOrFolder(filePath, isFile);
      return true; // Successfully deleted.
    }
  } catch (error) {
    log.error("Error deleting file:", filePath, error);
  }
  return false; // Failed to delete.
};

/**
 * Updates the marked-for-deletion file with the remaining file paths.
 * @param markedFilePath Path to the marked-for-deletion file.
 * @param remaining List of file paths that were not deleted.
 */
const updateDeletionList = async (
  markedFilePath: string,
  remaining: string[],
): Promise<void> => {
  try {
    await fsPromise.writeFile(
      markedFilePath,
      JSON.stringify(remaining, null, 2),
    );
  } catch (error) {
    log.error("Error updating deletion list file:", error);
  }
};

/**
 * Processes the marked-for-deletion file and deletes the listed files.
 */
const deleteMarkedForDeletion = async (): Promise<void> => {
  const markedFilePath = helpers.getMarkedForDeletionFilePath();

  if (!(await helpers.fileExists(markedFilePath))) {
    return; // No marked-for-deletion file exists.
  }

  let deletionList: string[] = [];
  try {
    deletionList = await readDeletionList(markedFilePath);
  } catch (error) {
    return; // Exit if there's an error reading the deletion list.
  }

  const remaining: string[] = [];
  for (const filePath of deletionList) {
    const wasDeleted = await deleteFileSafely(filePath);
    if (!wasDeleted) {
      remaining.push(filePath); // Keep track of files that couldn't be deleted.
    }
  }

  await updateDeletionList(markedFilePath, remaining);
};

const clearthumbnailsMetadata = async () => {
  const cachePath = helpers.getThumbnailCacheFilePath();
  if (await helpers.fileExists(cachePath)) {
    await fsPromise.writeFile(cachePath, JSON.stringify({}, null, 2));
  }
};

export const runAppOpeningCleanup = () => {
  deleteMarkedForDeletion();
};

export const runAppClosingCleanup = () => {
  clearthumbnailsMetadata();
};
