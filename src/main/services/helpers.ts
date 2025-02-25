import { app } from "electron";

export function normalizeFilePath(filePath: string): string {
  return filePath.replace(/\\/g, "/");
}

export const getThumbnailCacheFilePath = () => {
    return app.getPath("userData") + "/thumbnailCache.json";
  };
