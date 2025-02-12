import { RootState } from "./index";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface VideoPlayerState {
  videoPlayer: HTMLVideoElement | null;
  videoEnded: boolean;
  mkvCurrentTime: number;
  currentTime: number;
}

const initialState: VideoPlayerState = {
  videoPlayer: {} as HTMLVideoElement,
  videoEnded: false,
  mkvCurrentTime: 0,
  currentTime: 0,
};

const videoPlayerSlice = createSlice({
  name: "videoPlayer",
  initialState,
  reducers: {
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
  },
});

const videoPlayerActions = videoPlayerSlice.actions;

const selVideoPlayer = (state: RootState) => state.videoPlayer.videoPlayer;
const selVideoEnded = (state: RootState) => state.videoPlayer.videoEnded;
const selMkvCurrentTime = (state: RootState) =>
  state.videoPlayer.mkvCurrentTime;
const selCurrentTime = (state: RootState) => state.videoPlayer.currentTime;

export {
  videoPlayerSlice,
  videoPlayerActions,
  selVideoPlayer,
  selVideoEnded,
  selMkvCurrentTime,
  selCurrentTime,
};
