import { useSelector } from "react-redux";
import {
  selMkvCurrentTime,
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
  const mkvCurrentTime = useSelector(selMkvCurrentTime);
  const [isTheaterMode, setIsTheaterMode] = useState(true);

  const setVideoEnded = (isVideoEnded: boolean) => {
    dispatch(videoPlayerActions.setVideoEnded(isVideoEnded));
  };

  const setMkvCurrentTime = (currentTime: number) => {
    dispatch(videoPlayerActions.setMkvCurrentTime(currentTime));
  };

  const updateVideoDBCurrentTime = async (isEpisode = false) => {
    if (
      isEmptyObject(currentVideo) ||
      !player ||
      (currentVideo.isMkv ? mkvCurrentTime : player.currentTime) <= 0
    ) {
      return;
    }

    let currentTime = currentVideo.isMkv ? mkvCurrentTime : player.currentTime;
    currentTime = currentTime === currentVideo.duration ? 1 : currentTime;

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
    updateVideoDBCurrentTime,
    isTheaterMode,
    setIsTheaterMode,
    resetVideo,
    mkvCurrentTime,
    setMkvCurrentTime,
  };
};
