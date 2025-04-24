import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Mp4ConversionProgress {
  fromPath: string;
  toPath: string;
  percent: number;
  paused: boolean;
  complete: boolean;
}

interface Mp4ConversionState {
  convertToMp4Progress: Mp4ConversionProgress[];
  currentlyProcessingItem?: Mp4ConversionProgress;
}

const initialState: Mp4ConversionState = {
  convertToMp4Progress: [],
};

const mp4ConversionSlice = createSlice({
  name: "mp4Conversion",
  initialState,
  reducers: {
    updateConvertToMp4Progress: (
      state,
      action: PayloadAction<Mp4ConversionProgress>,
    ) => {
      const { fromPath, toPath, percent, paused, complete } = action.payload;
      const existingProgress = state.convertToMp4Progress.find(
        (progress) => progress.fromPath === fromPath,
      );
      if (!existingProgress) {
        state.convertToMp4Progress.push({
          fromPath,
          toPath,
          percent,
          paused: paused ?? false,
          complete,
        });
      } else {
        existingProgress.toPath = toPath;
        existingProgress.paused = paused;
        if (!existingProgress.complete) {
          existingProgress.complete = complete;
        }
        if (existingProgress.percent !== 100) {
          existingProgress.percent = percent;
        }
      }
    },
    setCurrentlyProcessingItem: (
      state,
      action: PayloadAction<Mp4ConversionProgress>,
    ) => {
      state.currentlyProcessingItem = action.payload;
    },
    clearCompleteConversions: (state) => {
      state.convertToMp4Progress = state.convertToMp4Progress.filter(
        (progress) => progress.percent < 100,
      );
    },
    removeFromConversionQueue: (state, action: PayloadAction<string>) => {
      const fromPath = action.payload;
      state.convertToMp4Progress = state.convertToMp4Progress.filter(
        (progress) => progress.fromPath !== fromPath,
      );
      if (state.currentlyProcessingItem?.fromPath === fromPath) {
        state.currentlyProcessingItem = undefined;
      }
    },
  },
});

export const mp4ConversionActions = {
  ...mp4ConversionSlice.actions,
};

export { mp4ConversionSlice };
