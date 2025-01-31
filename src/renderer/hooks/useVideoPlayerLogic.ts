import { useSelector } from "react-redux";
import {
  selVideoEnded,
  selVideoPlayer,
  videoPlayerActions,
} from "../store/videoPlayer.slice";
import { useAppDispatch } from "../store";
// import { IPCChannels } from "../../enums/IPCChannels";
import { ipcRenderer } from "electron";
import { selCurrentVideo } from "../store/currentVideo.slice";
import { isEmptyObject } from "../../util/helperFunctions";
import { useState } from "react";
import { selVideoJson, videoJsonActions } from "../store/videoJson.slice";
import { VideoDataModel } from "../../models/videoData.model";
import { VideoDataIpcChannels } from "../../enums/video-data-IPC-channels.enum";

export const useVideoPlayerLogic = () => {
  const dispatch = useAppDispatch();
  const player = useSelector(selVideoPlayer);
  const videoEnded = useSelector(selVideoEnded);
  const currentVideo = useSelector(selCurrentVideo);
  const videoJsonData = useSelector(selVideoJson);
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

    // await ipcRenderer.invoke(VideoDataIpcChannels.SaveLastWatch, {
    //   currentVideo,
    //   lastWatched: lastWatchedTime,
    //   isEpisode,
    // });
  };

  const resetVideo = () => {
    const newVideoJsonData: VideoDataModel = {
      ...videoJsonData,
      lastWatched: 1,
    };

    return dispatch(
      videoJsonActions.postVideoJason({
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
