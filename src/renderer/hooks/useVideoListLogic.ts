import { useState } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../store";
import { selVideoPlayer, videoPlayerActions } from "../store/videoPlayer.slice";
import { VideoDataModel } from "../../models/videoData.model";
import { useVideoPlayerLogic } from "./useVideoPlayerLogic";

export const useVideoListLogic = () => {
  const dispatch = useAppDispatch();
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const player = useSelector(selVideoPlayer);
  const { updateVideoDBCurrentTime } = useVideoPlayerLogic();

  const setCurrentVideo = (video: VideoDataModel) => {
    dispatch(videoPlayerActions.setCurrentVideo(video));
  };

  const handleVideoSelect = (video: VideoDataModel) => {
    updateVideoDBCurrentTime();
    if (!video.isDirectory) {
      dispatch(videoPlayerActions.setCurrentVideo(video));
    }
  };

  const setPlayer = (p: HTMLVideoElement) => {
    dispatch(videoPlayerActions.setVideoPlayer(p));
  };

  const clearPlayer = () => {
    dispatch(videoPlayerActions.clearVideoPlayer());
  };

  return {
    showSettingsDialog,
    setShowSettingsDialog,
    showDialog,
    setShowDialog,
    handleVideoSelect,
    player,
    setPlayer,
    setCurrentVideo,
    clearPlayer,
  };
};
