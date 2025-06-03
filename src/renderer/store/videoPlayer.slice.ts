import { VideoDataModel } from "../../models/videoData.model";
import { RootState } from "./index";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface VideoPlayerState {
  videoPlayer: HTMLVideoElement | null;
  videoEnded: boolean;
  mkvCurrentTime: number;
  currentTime: number;
  lastVideoPlayedDate: string;
  currentVideo: VideoDataModel | null;
}

const initialState: VideoPlayerState = {
  videoPlayer: {} as HTMLVideoElement,
  currentVideo: {} as VideoDataModel,
  videoEnded: false,
  mkvCurrentTime: 0,
  currentTime: 0,
  lastVideoPlayedDate: "",
};

const videoPlayerSlice = createSlice({
  name: "videoPlayer",
  initialState,
  reducers: {
    setCurrentVideo: (state, action: PayloadAction<VideoDataModel>) => {
      state.currentVideo = { ...state.currentVideo, ...action.payload };
    },
    setVideoPlayer: (state, action) => {
      state.videoPlayer = action.payload;
    },
    setVideoEnded: (state, action: PayloadAction<boolean>) => {
      state.videoEnded = action.payload;
    },
    clearVideoPlayer: (state) => {
      state.videoPlayer = null;
    },
    setMkvCurrentTime: (state, action: PayloadAction<number>) => {
      state.mkvCurrentTime = action.payload;
    },
    setCurrentTime: (state, action: PayloadAction<number>) => {
      state.currentTime = action.payload;
    },
    setLastVideoPlayedDate: (state, action: PayloadAction<string>) => {
      state.lastVideoPlayedDate = action.payload;
    },
  },
});

const videoPlayerActions = videoPlayerSlice.actions;

const selVideoPlayer = (state: RootState) => state.videoPlayer.videoPlayer;
const selVideoEnded = (state: RootState) => state.videoPlayer.videoEnded;
const selMkvCurrentTime = (state: RootState) =>
  state.videoPlayer.mkvCurrentTime;
const selCurrentTime = (state: RootState) => state.videoPlayer.currentTime;
const selLastVideoPlayedDate = (state: RootState) =>
  state.videoPlayer.lastVideoPlayedDate;
const selCurrentVideo = (state: RootState) => state.videoPlayer.currentVideo;


export {
  videoPlayerSlice,
  videoPlayerActions,
  selVideoPlayer,
  selVideoEnded,
  selMkvCurrentTime,
  selCurrentTime,
  selLastVideoPlayedDate,
  selCurrentVideo
};
