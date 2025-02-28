import {
  deleteFileOrFolder,
  fileExists,
  getFileInfo,
  getMarkedForDeletionFilePath,
  readFileDataAsync,
} from "./helpers";
import { loggingService as log } from "./main-logging.service";
import fsPromise from "fs/promises";

export const deleteMarkedForDeletion = async () => {
  const markedFilePath = getMarkedForDeletionFilePath();
  if (await fileExists(markedFilePath)) {
    let list: string[] = [];
    try {
      const content = await readFileDataAsync(markedFilePath);
      list = JSON.parse(content);
      console.log("Marked for deletion list:", list);
    } catch (error) {
      log.error("Error processing deletion list:", error);
      return;
    }
    // Process each file sequentially and track undeleted ones.
    const remaining: string[] = [];
    for (const filePath of list) {
      try {
        const { isFile } = await getFileInfo(filePath);
        if (await fileExists(filePath)) {
          await deleteFileOrFolder(filePath, isFile);
        }
        // Successfully deleted: do not add to remaining list.
      } catch (error) {
        log.error("Error deleting file:", filePath, error);
        // On error, keep the file path.
        remaining.push(filePath);
      }
    }
    // Update marked-for-deletion file with filepaths not deleted.
    try {
      //await writeFileDataAsync(markedFilePath, JSON.stringify(remaining));
      await fsPromise.writeFile(
        markedFilePath,
        JSON.stringify(remaining, null, 2)
      );
    } catch (error) {
      log.error("Error updating deletion list file:", error);
    }
  }
};
