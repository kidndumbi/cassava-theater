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
import { updateVideoData } from "../api/videoData.api";

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
    if (isEmptyObject(currentVideo) || !player) return;

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
    const newVideoJsonData: VideoDataModel = {
      ...currentVideo,
      currentTime: 1,
    };

    return updateVideoData({ currentVideo, newVideoJsonData });
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
