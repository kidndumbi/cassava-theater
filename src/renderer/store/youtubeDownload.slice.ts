import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { YoutubeDownloadQueueItem } from "../../main/services/youtube.service";
import { RootState } from "./index";

const youtubeDownloadSlice = createSlice({
  name: "youtubeDownload",
  initialState: {
    downloadProgress: [] as YoutubeDownloadQueueItem[],
  },
  reducers: {
    setDownloadProgress(
      state,
      action: PayloadAction<YoutubeDownloadQueueItem[]>,
    ) {
      state.downloadProgress = action.payload;
    },
  },
});

const selYoutubeDownloadProgress = (state: RootState) =>
  state.youtubeDownload.downloadProgress;

const youtubeDownloadActions = {
  ...youtubeDownloadSlice.actions,
};

export {
  youtubeDownloadSlice,
  youtubeDownloadActions,
  selYoutubeDownloadProgress,
};
