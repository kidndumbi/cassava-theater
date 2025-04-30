import { useState, useEffect } from "react";
import { useVideoPlayerLogic } from "./useVideoPlayerLogic";
import { VideoDataModel } from "../../models/videoData.model";

const useSubtitle = () => {
  const [subtitleFilePath, setSubtitleFilePath] = useState<string | null>(null);
  const { currentVideo } = useVideoPlayerLogic();

  useEffect(() => {
    const subtitlePath = currentVideo?.subtitlePath || "None";
    setSubtitleFilePath(subtitlePath);
  }, [currentVideo]);

  const updateSubtitle = async (subtitlePath: string | null, videoData: VideoDataModel) => {
    await window.videoAPI.saveVideoJsonData({
      currentVideo: videoData,
      newVideoJsonData: { subtitlePath },
    });
  };

  return { subtitleFilePath, updateSubtitle, setSubtitleFilePath };
};

export { useSubtitle };
