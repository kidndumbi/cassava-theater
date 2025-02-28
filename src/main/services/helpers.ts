import { app } from "electron";
import fsPromise, { readFile, access } from "fs/promises";
import * as fs from "fs";
import * as path from "path";

import { loggingService as log } from "./main-logging.service";

export function normalizeFilePath(filePath: string): string {
  return filePath.replace(/\\/g, "/");
}

export const getThumbnailCacheFilePath = () => {
  return app.getPath("userData") + "/thumbnailCache.json";
};

export const getVideoDataFilePath = () => {
  return app.getPath("userData") + "/videoData.json";
};

export const getMarkedForDeletionFilePath = () => {
  return app.getPath("userData") + "/markedForDeletion.json";
};

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function readFileData(
  filePath: string
): Promise<string | undefined> {
  try {
    const jsonFile = await readFile(filePath);
    return jsonFile?.toString();
  } catch (error) {
    log.error("Error in readFileData:", error);
  }
}

// Helper function to check if a file exists
export async function fileExistsAsync(filePath: string): Promise<boolean> {
  try {
    await fsPromise.access(filePath, fsPromise.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

// Helper function to read file data
export async function readFileDataAsync(filePath: string): Promise<string> {
  return await fsPromise.readFile(filePath, { encoding: "utf-8" });
}

// Helper functions
export async function verifyFileAccess(path: string): Promise<void> {
  await fsPromise.access(
    path,
    fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK
  );
}

export async function getFileInfo(
  filePath: string
): Promise<{ isFile: boolean; ext: string }> {
  const stats = await fs.promises.lstat(filePath);
  const isFile = stats.isFile();
  const ext = isFile ? path.extname(filePath).toLowerCase() : "";
  return { isFile, ext };
}

export async function getVideoFilesInChildFolders(
  folderPath: string
): Promise<string[]> {
  const allowedExtensions = new Set([".mp4", ".avi", ".mkv"]);
  const videoFiles: string[] = [];

  try {
    // Read the contents of the parent folder
    const childItems = await fs.promises.readdir(folderPath, {
      withFileTypes: true,
    });

    for (const item of childItems) {
      // Only process child folders (not files or deeper subfolders)
      if (item.isDirectory()) {
        const childFolderPath = path.join(folderPath, item.name);

        // Read the contents of the child folder
        const childFolderItems = await fs.promises.readdir(childFolderPath, {
          withFileTypes: true,
        });

        for (const childItem of childFolderItems) {
          // Only process files (not subfolders)
          if (childItem.isFile()) {
            const fileExtension = path.extname(childItem.name).toLowerCase();

            // Check if the file has one of the allowed extensions
            if (allowedExtensions.has(fileExtension)) {
              videoFiles.push(
                normalizeFilePath(path.join(childFolderPath, childItem.name))
              );
            }
          }
        }
      }
    }

    return videoFiles;
  } catch (error) {
    console.error(`Error reading folder ${folderPath}:`, error);
    throw error;
  }
}

// Add helper to mark files for deletion
export async function addToMarkedForDeletion(filePath: string): Promise<void> {
	// Get the path to markedForDeletion.json
	const markedFilePath = getMarkedForDeletionFilePath();
	let list: string[] = [];
	// Check if file exists and read its array, else start with []
	if (await fileExists(markedFilePath)) {
		try {
			const content = await readFileDataAsync(markedFilePath);
			list = JSON.parse(content);
		} catch {
			list = [];
		}
	}
	// Add file path if not already present
	if (!list.includes(filePath)) {
		list.push(filePath);
	}
	// Write back the updated array
	try {
		await fsPromise.writeFile(markedFilePath, JSON.stringify(list, null, 2));
	} catch (e) {
		log.error("Error updating markedForDeletion.json for", filePath, e);
	}
}

// Updated deleteFileOrFolder to add paths to markedForDeletion.json on error
export async function deleteFileOrFolder(pathStr: string, isFile: boolean): Promise<void> {
	// For files
	if (isFile) {
		try {
			await fsPromise.unlink(pathStr);
		} catch (error) {
			log.error("Error deleting file:", pathStr, error);
			await addToMarkedForDeletion(pathStr);
		}
	} else {
		// Process video files inside folder
		let videoFiles: string[] = [];
		try {
			videoFiles = await getVideoFilesInChildFolders(pathStr);
		} catch (error) {
			log.error("Error getting video files for folder:", pathStr, error);
			// Continue, no marking as error on reading folder here
		}
		for (const videoFile of videoFiles) {
			try {
				await fsPromise.unlink(videoFile);
			} catch (error) {
				log.error("Error deleting video file:", videoFile, error);
				await addToMarkedForDeletion(videoFile);
			}
		}

		// Process child folders
		let childFolders: string[] = [];
		try {
			childFolders = await getChildFolderPaths(pathStr);
		} catch (error) {
			log.error("Error getting child folders for:", pathStr, error);
		}
		for (const childFolder of childFolders) {
			try {
				await fsPromise.rm(childFolder, { recursive: true, force: true });
			} catch (error) {
				log.error("Error deleting child folder:", childFolder, error);
				await addToMarkedForDeletion(childFolder);
			}
		}
		// Finally, delete the parent folder
		try {
			await fsPromise.rm(pathStr, { recursive: true, force: true });
		} catch (error) {
			log.error("Error deleting folder:", pathStr, error);
			await addToMarkedForDeletion(pathStr);
		}
	}
}

export async function getChildFolderPaths(
  parentFolderPath: string
): Promise<string[]> {
  try {
    const items = await fs.promises.readdir(parentFolderPath, {
      withFileTypes: true,
    });
    const childFolders = items
      .filter((item) => item.isDirectory())
      .map((item) => normalizeFilePath(path.join(parentFolderPath, item.name)));
    return childFolders;
  } catch (error) {
    log.error(`Error reading folder ${parentFolderPath}:`, error);
    throw error;
  }
}
