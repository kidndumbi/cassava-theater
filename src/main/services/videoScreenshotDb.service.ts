import { VideoScreenshotModel } from "../../models/video-screenshot.model";
import { levelDBService, KeyType } from "./levelDB.service";

export const putVideoScreenshot = async (
  key: KeyType,
  value: Partial<VideoScreenshotModel>,
): Promise<void> => {
    console.log("putVideoScreenshot::::::::::::::::::::::::::::::::::", key);
  const existing = (await getVideoScreenshot(key)) || {};
  return levelDBService.put("videoScreenshots", key, { ...existing, ...value });
};

export const getVideoScreenshot = (
  key: KeyType,
): Promise<VideoScreenshotModel | null> => {
  return levelDBService.get("videoScreenshots", key);
};

export const deleteVideoScreenshot = (
  key: KeyType,
): Promise<void> => {
  return levelDBService.delete("videoScreenshots", key);
};

export const getAllVideoScreenshots = (): Promise<VideoScreenshotModel[]> => {
  return levelDBService.getAll("videoScreenshots");
};
