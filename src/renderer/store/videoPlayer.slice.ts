import { RootState } from "./index";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface VideoPlayerState {
  videoPlayer: HTMLVideoElement | null;
  videoEnded: boolean;
}

const initialState: VideoPlayerState = {
  videoPlayer: {} as HTMLVideoElement,
  videoEnded: false,
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
    }
  },
});

const videoPlayerActions = videoPlayerSlice.actions;

const selVideoPlayer = (state: RootState) => state.videoPlayer.videoPlayer;
const selVideoEnded = (state: RootState) => state.videoPlayer.videoEnded;

export { videoPlayerSlice, videoPlayerActions, selVideoPlayer, selVideoEnded };
