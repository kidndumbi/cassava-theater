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
