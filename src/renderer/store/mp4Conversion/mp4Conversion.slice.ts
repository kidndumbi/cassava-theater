import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Mp4ConversionProgress {
  fromPath: string;
  toPath: string;
  percent: number;
  paused: boolean;
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
      const { fromPath, toPath, percent, paused } = action.payload;
      const existingProgress = state.convertToMp4Progress.find(
        (progress) => progress.fromPath === fromPath,
      );
      if (!existingProgress) {
        state.convertToMp4Progress.push({
          fromPath,
          toPath,
          percent,
          paused: false,
        });
      } else {
        existingProgress.percent = percent;
        existingProgress.toPath = toPath;
        existingProgress.paused = paused;
      }
    },
    setCurrentlyProcessingItem: (
      state,
      action: PayloadAction<Mp4ConversionProgress>,
    ) => {
      state.currentlyProcessingItem = action.payload;
    },
  },
});

export const mp4ConversionActions = {
  ...mp4ConversionSlice.actions,
};

export { mp4ConversionSlice };
