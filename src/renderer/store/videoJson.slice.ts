import { RootState } from "./index";
import { VideoDataModel } from "../../models/videoData.model";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

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

    console.log("getVideoJson", currentVideo);
    // const response = await ipcRenderer.invoke(
    //   VideoDataIpcChannels.GetVideoJsonData,
    //   currentVideo
    // );
    const response: any = [];
    return response;
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
    // const response = await ipcRenderer.invoke(VideoDataIpcChannels.SaveVideoJsonData, {
    //   currentVideo,
    //   newVideoJsonData,
    // });
    const response: any = [];

    return response;
  }
);

const selVideoJson = (state: RootState) => state.videoJson.videoJson;

const videoJsonActions = { getVideoJson, postVideoJason };

export { videoJsonSlice, videoJsonActions, selVideoJson };
