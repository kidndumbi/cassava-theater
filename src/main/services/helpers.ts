import { app } from "electron";
import fsPromise, { access } from "fs/promises";
import * as fs from "fs";
import * as path from "path";
import { loggingService as log } from "./main-logging.service";
import * as markedForDeleteService from "./markedForDelete.service";

export const SUPPORTED_VIDEO_EXTENSIONS = [".mp4", ".mkv", ".avi"];
export const DEFAULT_THUMBNAIL_URL =
  "https://res.cloudinary.com/cassavacloudinary/image/upload/v1718668161/LBFilmReel_991x.progressive.jpg";

export function normalizeFilePath(filePath: string): string {
  return filePath.replace(/\\/g, "/");
}

export const getThumbnailCacheFilePath = () => {
  return app.getPath("userData") + "/thumbnailCache.json";
};

export const isVideoFile = (file: string): boolean => {
  const extension = path.extname(file).toLowerCase();
  return SUPPORTED_VIDEO_EXTENSIONS.includes(extension);
};

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
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
    fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK,
  );
}

export async function getFileInfo(
  filePath: string,
): Promise<{ isFile: boolean; ext: string }> {
  const stats = await fs.promises.lstat(filePath);
  const isFile = stats.isFile();
  const ext = isFile ? path.extname(filePath).toLowerCase() : "";
  return { isFile, ext };
}

export async function getVideoFilesInChildFolders(
  folderPath: string,
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
                normalizeFilePath(path.join(childFolderPath, childItem.name)),
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

// Add helper to mark files for deletion using LevelDB
export async function addToMarkedForDeletion(filePath: string): Promise<void> {
  try {
    await markedForDeleteService.addMarkedForDelete(filePath);
  } catch (e) {
    log.error("Error updating markedForDelete collection for", filePath, e);
  }
}

// Updated deleteFileOrFolder to add paths to markedForDeletion.json on error
export async function deleteFileOrFolder(
  pathStr: string,
  isFile: boolean,
): Promise<void> {
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
  parentFolderPath: string,
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
