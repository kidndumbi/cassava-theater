import { VideoDataModel } from "./../../models/videoData.model";
import { levelDBService, KeyType } from "./levelDB.service";

export const putVideo = async (
  key: KeyType,
  value: Partial<VideoDataModel>,
): Promise<void> => {
  const existing = (await getVideo(key)) || {};
  return levelDBService.put("videos", key, { ...existing, ...value });
};

export const getVideo = (key: KeyType): Promise<VideoDataModel | null> => {
  return levelDBService.get("videos", key);
};

export const deleteVideo = (key: KeyType): Promise<void> => {
  return levelDBService.delete("videos", key);
};

export const getAllVideos = (): Promise<VideoDataModel[]> => {
  return levelDBService.getAll("videos");
};
