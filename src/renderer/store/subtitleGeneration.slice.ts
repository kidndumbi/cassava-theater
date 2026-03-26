import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SubtitleGenerationQueueItem } from "../../models/subtitle-generation-queue-item.model";
import { RootState } from "./index";

const subtitleGenerationSlice = createSlice({
  name: "subtitleGeneration",
  initialState: {
    generationProgress: [] as SubtitleGenerationQueueItem[],
  },
  reducers: {
    setSubtitleGenerationProgress: (
      state,
      action: PayloadAction<SubtitleGenerationQueueItem[]>,
    ) => {
      state.generationProgress = action.payload;
    },
  },
});

const selSubtitleGenerationProgress = (state: RootState) =>
  state.subtitleGeneration.generationProgress;

const subtitleGenerationActions = {
  ...subtitleGenerationSlice.actions,
};

export {
  subtitleGenerationSlice,
  subtitleGenerationActions,
  selSubtitleGenerationProgress,
};