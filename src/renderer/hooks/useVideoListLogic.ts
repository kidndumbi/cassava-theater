import { useState } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../store";
import { selFoldersVideosInfo } from "../store/folderVideosInfo.slice";
import { currentVideoActions } from "../store/currentVideo.slice";
import { selVideoPlayer, videoPlayerActions } from "../store/videoPlayer.slice";
import { VideoDataModel } from "../../models/videoData.model";
import { useVideoPlayerLogic } from "./useVideoPlayerLogic";

export const useVideoListLogic = () => {
  const dispatch = useAppDispatch();
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const player = useSelector(selVideoPlayer);
  const folderVideosInfo = useSelector(selFoldersVideosInfo);
  const { updateVideoDBCurrentTime } = useVideoPlayerLogic();

  const setCurrentVideo = (video: VideoDataModel) => {
    dispatch(currentVideoActions.setCurrentVideo(video));
  };

  const handleVideoSelect = (video: VideoDataModel) => {
    updateVideoDBCurrentTime();
    if (!video.isDirectory) {
      dispatch(currentVideoActions.setCurrentVideo(video));
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
    folderVideosInfo,
    handleVideoSelect,
    player,
    setPlayer,
    setCurrentVideo,
    clearPlayer,
  };
};
