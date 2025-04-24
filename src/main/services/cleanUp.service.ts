import * as helpers from "./helpers";
import { loggingService as log } from "./main-logging.service";
import * as videoDbDataService from "./videoDbData.service";
import * as markedForDeleteService from "./markedForDelete.service";

/**
 * Reads the marked-for-deletion list from LevelDB.
 * @returns List of file paths marked for deletion.
 */
const readDeletionList = async (): Promise<string[]> => {
  try {
    return await markedForDeleteService.getAllMarkedForDelete();
  } catch (error) {
    log.error("Error processing deletion list:", error);
    throw error;
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
 * Updates the marked-for-deletion list in LevelDB with the remaining file paths.
 * @param remaining List of file paths that were not deleted.
 */
const updateDeletionList = async (remaining: string[]): Promise<void> => {
  try {
    // Remove all entries, then re-add remaining
    const all = await markedForDeleteService.getAllMarkedForDelete();
    for (const filePath of all) {
      await markedForDeleteService.removeMarkedForDelete(filePath);
    }
    for (const filePath of remaining) {
      await markedForDeleteService.addMarkedForDelete(filePath);
    }
  } catch (error) {
    log.error("Error updating deletion list:", error);
  }
};

/**
 * Processes the marked-for-deletion list and deletes the listed files.
 */
const deleteMarkedForDeletion = async (): Promise<void> => {
  let deletionList: string[] = [];
  try {
    deletionList = await readDeletionList();
  } catch (error) {
    return; // Exit if there's an error reading the deletion list.
  }

  const remaining: string[] = [];
  for (const filePath of deletionList) {
    const wasDeleted = await deleteFileSafely(filePath);
    if (!wasDeleted) {
      if (await helpers.fileExists(filePath)) {
        remaining.push(filePath); // Keep track of files that couldn't be deleted.
      }
    }
  }
  await updateDeletionList(remaining);
};

const cleanUpVideoData = async () => {
  try {
    const videoDbData = await videoDbDataService.getAllVideos();

    for (const video of videoDbData) {
      try {
        if (!(await helpers.fileExists(video.filePath))) {
          await videoDbDataService.deleteVideo(video.filePath);
        } else if (video.videoProgressScreenshot) {
          delete video.videoProgressScreenshot;
          await videoDbDataService.putVideo(video.filePath, video);
        }
      } catch (error) {
        log.error(
          `Error processing key in cleanUpVideoData "${video.filePath}":`,
          error,
        );
      }
    }
  } catch (error) {
    log.error("Error fetching or processing video metadata:", error);
  }
};

export const runAppOpeningCleanup = () => {
  deleteMarkedForDeletion();
  cleanUpVideoData();
};
