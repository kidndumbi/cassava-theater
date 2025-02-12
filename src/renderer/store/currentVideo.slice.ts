import { VideoDataModel } from "../../models/videoData.model";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./index";

const initialState: { currentVideo: VideoDataModel } = {
  currentVideo: {} as VideoDataModel,
};

const currentVideoSlice = createSlice({
  name: "currentVideo",
  initialState,
  reducers: {
    setCurrentVideo: (state, action: PayloadAction<VideoDataModel>) => {
      state.currentVideo = { ...state.currentVideo, ...action.payload };
    },
  },
});

const currentVideoActions = {
  ...currentVideoSlice.actions,
};

const selCurrentVideo = (state: RootState) => state.currentVideo.currentVideo;

export { currentVideoSlice, currentVideoActions, selCurrentVideo };
