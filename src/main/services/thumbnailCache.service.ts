// Helper function to read cache

import * as fs from "fs";

export interface ThumbnailCache {
  [key: string]: { image: string; currentTime: number };
}

export const readThumbnailCache = (cacheFilePath: string): ThumbnailCache => {
  if (fs.existsSync(cacheFilePath)) {
    const data = fs.readFileSync(cacheFilePath, "utf-8");
    return !data ? {} : JSON.parse(data);
  }
  return {};
};

// Helper function to write cache
export const writeThumbnailCache = (
  cache: ThumbnailCache,
  cacheFilePath: string
) => {
  fs.writeFileSync(cacheFilePath, JSON.stringify(cache, null, 2), "utf-8");
};
