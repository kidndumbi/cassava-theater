import { useState, useEffect } from "react";
import { useVideoPlayerLogic } from "./useVideoPlayerLogic";
import { useAppDispatch } from "../store";
import { VideoDataModel } from "../../models/videoData.model";
import { postVideoJason } from "../store/videoInfo/folderVideosInfoActions";

const useSubtitle = () => {
  const dispatch = useAppDispatch();
  const [subtitleFilePath, setSubtitleFilePath] = useState<string | null>(null);
  const { currentVideo } = useVideoPlayerLogic();

  useEffect(() => {
    const subtitlePath = currentVideo?.subtitlePath || "None";
    setSubtitleFilePath(subtitlePath);
  }, [currentVideo]);

  const updateSubtitle = async (subtitlePath: string | null, videoData: VideoDataModel) => {
    await dispatch(
      postVideoJason({
        currentVideo: videoData,
        newVideoJsonData: { subtitlePath },
      })
    );
  };

  return { subtitleFilePath, updateSubtitle, setSubtitleFilePath };
};

export { useSubtitle };
