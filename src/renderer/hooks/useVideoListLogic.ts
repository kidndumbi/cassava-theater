import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../store";
import { selFoldersVideosInfo } from "../store/folderVideosInfo.slice";
import { currentVideoActions } from "../store/currentVideo.slice";
import {
  selVideoPlayer,
  videoPlayerActions,
} from "../store/videoPlayer.slice";
import { selVideoJson } from "../store/videoJson.slice";
import { VideoDataModel } from "../../models/videoData.model";
import { useVideoPlayerLogic } from "./useVideoPlayerLogic";

export const useVideoListLogic = () => {
  const dispatch = useAppDispatch();
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState<VideoDataModel[]>([]);
  const player = useSelector(selVideoPlayer);
  const folderVideosInfo = useSelector(selFoldersVideosInfo);
  const videoJsonData = useSelector(selVideoJson);

  const { updateLastWatched } = useVideoPlayerLogic();

  useEffect(() => {
    if (player && player.currentTime && videoJsonData.lastWatched) {
      player.currentTime = videoJsonData.lastWatched;
    }
  }, [player, videoJsonData.lastWatched]);

  const setCurrentVideo = (video: VideoDataModel) => {
    dispatch(currentVideoActions.setCurrentVideo(video));
  };

  const handleVideoSelect = (video: VideoDataModel) => {
    updateLastWatched();
    if (!video.isDirectory) {
      dispatch(currentVideoActions.setCurrentVideo(video));
    } else {
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
    selectedVideos,
    folderVideosInfo,
    handleVideoSelect,
    // deleteVideos,
    player,
    videoJsonData,
    setPlayer,
    setCurrentVideo,
    clearPlayer,
  };
};
