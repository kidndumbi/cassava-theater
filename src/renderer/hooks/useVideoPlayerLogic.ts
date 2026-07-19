import { useVideoPlayerContext } from "../contexts/VideoPlayerContext";
import { isEmptyObject } from "../util/helperFunctions";
import { useState } from "react";
import { VideoDataModel } from "../../models/videoData.model";

export const useVideoPlayerLogic = () => {
  const {
    videoPlayerRef,
    currentVideo,
    videoEnded,
    mkvCurrentTime,
    currentTime,
    lastVideoPlayedDate,
    setVideoEnded: ctxSetVideoEnded,
    setMkvCurrentTime: ctxSetMkvCurrentTime,
    setCurrentTime: ctxSetCurrentTime,
    setLastVideoPlayedDate: ctxSetLastVideoPlayedDate,
  } = useVideoPlayerContext();

  const player = videoPlayerRef.current;
  const [isTheaterMode, setIsTheaterMode] = useState(true);

  const setVideoEnded = (isVideoEnded: boolean) => {
    ctxSetVideoEnded(isVideoEnded);
  };

  const setMkvCurrentTime = (time: number) => {
    ctxSetMkvCurrentTime(time);
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

    const dbTime = time === currentVideo.duration ? 1 : time;

    ctxSetCurrentTime(dbTime);
    ctxSetLastVideoPlayedDate(new Date().toISOString());

    await window.videoAPI.saveVideoDbCurrentTime({
      currentVideo,
      currentTime: dbTime,
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