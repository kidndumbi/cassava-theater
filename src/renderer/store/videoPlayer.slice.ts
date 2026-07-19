import { VideoDataModel } from "../../models/videoData.model";
import { RootState } from "./index";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface VideoPlayerState {
  videoEnded: boolean;
  mkvCurrentTime: number;
  currentTime: number;
  lastVideoPlayedDate: string;
  currentVideo: VideoDataModel | null;
}

const initialState: VideoPlayerState = {
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
    clearCurrentVideo: (state) => {
      state.currentVideo = null;
    },
    setVideoPlayer: (state, action: PayloadAction<HTMLVideoElement>) => {
      // Deprecated: HTMLVideoElement is now managed via VideoPlayerContext.
      // This reducer exists only for backward compatibility during migration.
      // New code should use useVideoPlayerContext() instead.
    },
    setVideoEnded: (state, action: PayloadAction<boolean>) => {
      state.videoEnded = action.payload;
    },
    clearVideoPlayer: (state) => {
      // Deprecated: HTMLVideoElement is now managed via VideoPlayerContext.
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
  selVideoEnded,
  selMkvCurrentTime,
  selCurrentTime,
  selLastVideoPlayedDate,
  selCurrentVideo,
};