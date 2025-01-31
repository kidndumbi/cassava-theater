import { useState, useEffect } from "react";
import { useVideoPlayerLogic } from "./useVideoPlayerLogic";
import { useAppDispatch } from "../store";
import {  videoJsonActions } from "../store/videoJson.slice";
import { VideoDataModel } from "../../models/videoData.model";

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
      videoJsonActions.postVideoJason({
        currentVideo: videoData,
        newVideoJsonData: { subtitlePath },
      })
    );
  };

  return { subtitleFilePath, updateSubtitle, setSubtitleFilePath };
};

export { useSubtitle };
