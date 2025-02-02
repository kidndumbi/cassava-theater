import { useSelector } from "react-redux";
import {
  selVideoEnded,
  selVideoPlayer,
  videoPlayerActions,
} from "../store/videoPlayer.slice";
import { useAppDispatch } from "../store";
import { selCurrentVideo } from "../store/currentVideo.slice";
import { isEmptyObject } from "../util/helperFunctions";
import { useState } from "react";
import { VideoDataModel } from "../../models/videoData.model";
import { folderVideosInfoActions } from "../store/folderVideosInfo.slice";

export const useVideoPlayerLogic = () => {
  const dispatch = useAppDispatch();
  const player = useSelector(selVideoPlayer);
  const videoEnded = useSelector(selVideoEnded);
  const currentVideo = useSelector(selCurrentVideo);
  const [isTheaterMode, setIsTheaterMode] = useState(true);

  const setVideoEnded = (isVideoEnded: boolean) => {
    dispatch(videoPlayerActions.setVideoEnded(isVideoEnded));
  };

  const updateLastWatched = async (isEpisode: boolean = false) => {
    if (isEmptyObject(currentVideo) || !player || player.currentTime <= 0) {
      return;
    }

    const lastWatchedTime =
      player.currentTime === currentVideo.duration ? 1 : player.currentTime;

    await window.videoAPI.saveLastWatch({
      currentVideo,
      lastWatched: lastWatchedTime,
      isEpisode,
    });
  };

  const resetVideo = () => {
    const newVideoJsonData: VideoDataModel = {
      ...currentVideo,
      lastWatched: 1,
    };

    return dispatch(
      folderVideosInfoActions.postVideoJason({
        currentVideo,
        newVideoJsonData,
      })
    );
  };

  return {
    player,
    setVideoEnded,
    videoEnded,
    currentVideo,
    updateLastWatched,
    isTheaterMode,
    setIsTheaterMode,
    resetVideo,
  };
};
