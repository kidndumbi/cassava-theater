import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SubtitleSyncQueueItem } from "../../models/subtitle-sync-queue-item.model";
import { RootState } from "./index";

const subtitleSyncSlice = createSlice({
  name: "subtitleSync",
  initialState: {
    syncProgress: [] as SubtitleSyncQueueItem[],
  },
  reducers: {
    setSyncProgress: (
      state,
      action: PayloadAction<SubtitleSyncQueueItem[]>,
    ) => {
      state.syncProgress = action.payload;
    },
  },
});

const selSubtitleSyncProgress = (state: RootState) =>
  state.subtitleSync.syncProgress;

const subtitleSyncActions = {
  ...subtitleSyncSlice.actions,
};

export {
  subtitleSyncSlice,
  subtitleSyncActions,
  selSubtitleSyncProgress,
};