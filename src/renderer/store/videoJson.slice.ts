import { RootState } from "./index";
import { VideoDataModel } from "../../models/videoData.model";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { rendererLoggingService as log } from "../util/renderer-logging.service";

const videoJsonSlice = createSlice({
  name: "videoJson",
  initialState: { videoJson: {} } as { videoJson: VideoDataModel },
  reducers: {},
  extraReducers(builder) {
    builder.addCase(getVideoJson.fulfilled, (state, action) => {
      state.videoJson = action.payload;
    });

    builder.addCase(postVideoJason.fulfilled, (state, action) => {
      state.videoJson = action.payload;
    });
  },
});

const getVideoJson = createAsyncThunk(
  "videoJson/getVideoJson",
  async (currentVideo: VideoDataModel | undefined) => {
    try {
      return await window.videoAPI.getVideoJsonData(currentVideo);
    } catch (error) {
      log.error("Failed to get video JSON data:", error);

      throw error;
    }
  }
);

const postVideoJason = createAsyncThunk(
  "videoJson/postVideoJason",
  async ({
    currentVideo,
    newVideoJsonData,
  }: {
    currentVideo: VideoDataModel | undefined;
    newVideoJsonData: VideoDataModel | undefined;
  }) => {
    try {
      return await window.videoAPI.saveVideoJsonData({
        currentVideo,
        newVideoJsonData,
      });
    } catch (error) {
      log.error("Failed to post video JSON data:", error);
      throw error;
    }
  }
);

const selVideoJson = (state: RootState) => state.videoJson.videoJson;

const videoJsonActions = { getVideoJson, postVideoJason };

export { videoJsonSlice, videoJsonActions, selVideoJson };
