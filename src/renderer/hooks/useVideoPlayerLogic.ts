import { useSelector } from "react-redux";
import {
  selCurrentTime,
  selCurrentVideo,
  selLastVideoPlayedDate,
  selMkvCurrentTime,
  selVideoEnded,
  selVideoPlayer,
  videoPlayerActions,
} from "../store/videoPlayer.slice";
import { useAppDispatch } from "../store";
import { isEmptyObject } from "../util/helperFunctions";
import { useState } from "react";
import { VideoDataModel } from "../../models/videoData.model";

export const useVideoPlayerLogic = () => {
  const dispatch = useAppDispatch();
  const player = useSelector(selVideoPlayer);
  const videoEnded = useSelector(selVideoEnded);
  const currentVideo = useSelector(selCurrentVideo);
  const mkvCurrentTime = useSelector(selMkvCurrentTime);
  const currentTime = useSelector(selCurrentTime);
  const lastVideoPlayedDate = useSelector(selLastVideoPlayedDate);
  const [isTheaterMode, setIsTheaterMode] = useState(true);

  const setVideoEnded = (isVideoEnded: boolean) => {
    dispatch(videoPlayerActions.setVideoEnded(isVideoEnded));
  };

  const setMkvCurrentTime = (currentTime: number) => {
    dispatch(videoPlayerActions.setMkvCurrentTime(currentTime));
  };

  const updateVideoDBCurrentTime = async (isEpisode = false) => {
    if (!currentVideo || isEmptyObject(currentVideo) || !player) return;

    if (!currentVideo.duration || player.currentTime > currentVideo.duration) {
      return;
    }

    const time =
      currentVideo.isMkv || currentVideo.isAvi
        ? mkvCurrentTime
        : player.currentTime;
    if (time <= 0) return;

    const currentTime = time === currentVideo.duration ? 1 : time;

    dispatch(videoPlayerActions.setCurrentTime(currentTime));
    dispatch(
      videoPlayerActions.setLastVideoPlayedDate(new Date().toISOString()),
    );

    await window.videoAPI.saveVideoDbCurrentTime({
      currentVideo,
      currentTime,
      isEpisode,
    });
  };

  const resetVideo = () => {
    if (!currentVideo || isEmptyObject(currentVideo)) return;

    const newVideoJsonData: VideoDataModel = {
      ...currentVideo,
      currentTime: 1,
    };

    return window.videoAPI.saveVideoJsonData({
      currentVideo,
      newVideoJsonData,
    });
  };

  return {
    player,
    setVideoEnded,
    videoEnded,
    currentVideo,
    updateVideoDBCurrentTime,
    isTheaterMode,
    setIsTheaterMode,
    resetVideo,
    mkvCurrentTime,
    setMkvCurrentTime,
    currentTime,
    lastVideoPlayedDate,
  };
};
