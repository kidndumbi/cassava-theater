import { useState } from "react";
import { useAppDispatch } from "../store";
import { videoPlayerActions } from "../store/videoPlayer.slice";
import { VideoDataModel } from "../../models/videoData.model";
import { useVideoPlayerLogic } from "./useVideoPlayerLogic";
import { useVideoPlayerContext } from "../contexts/VideoPlayerContext";

export const useVideoListLogic = () => {
  const dispatch = useAppDispatch();
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const { videoPlayerRef, setCurrentVideo: ctxSetCurrentVideo, clearPlayer: ctxClearPlayer, setPlayer: ctxSetPlayer } = useVideoPlayerContext();
  const player = videoPlayerRef.current;
  const { updateVideoDBCurrentTime } = useVideoPlayerLogic();

  const setCurrentVideo = (video: VideoDataModel | null) => {
    ctxSetCurrentVideo(video);
    // Keep Redux in sync for any remaining consumers during migration
    if (video === null) {
      dispatch(videoPlayerActions.clearCurrentVideo());
    } else {
      dispatch(videoPlayerActions.setCurrentVideo(video));
    }
  };

  const handleVideoSelect = (video: VideoDataModel) => {
    updateVideoDBCurrentTime();
    if (!video.isDirectory) {
      setCurrentVideo(video);
    }
  };

  const setPlayer = (p: HTMLVideoElement) => {
    ctxSetPlayer(p);
    // Keep Redux in sync for remaining consumers
    dispatch(videoPlayerActions.setVideoPlayer(p));
  };

  const clearPlayer = () => {
    dispatch(videoPlayerActions.clearVideoPlayer());
    dispatch(videoPlayerActions.clearCurrentVideo());
    ctxClearPlayer();
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