import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Mp4ConversionProgress {
  fromPath: string;
  toPath: string;
  percent: number;
  complete: boolean;
}

interface Mp4ConversionState {
  convertToMp4Progress: Mp4ConversionProgress[];
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
      action: PayloadAction<{
        fromPath: string;
        toPath: string;
        percent: number;
      }>
    ) => {
      const { fromPath, toPath, percent } = action.payload;
      const existingProgress = state.convertToMp4Progress.find(
        (progress) => progress.fromPath === fromPath
      );
      if (!existingProgress) {
        state.convertToMp4Progress.push({
          fromPath,
          toPath,
          percent,
          complete: false,
        });
      } else {
        existingProgress.percent = percent;
        existingProgress.toPath = toPath;
      }
    },
    markMp4ConversionAsComplete: (state, action: PayloadAction<string>) => {
      const fromPath = action.payload;
      const existingProgress = state.convertToMp4Progress.find(
        (progress) => progress.fromPath === fromPath
      );
      if (existingProgress) {
        existingProgress.complete = true;
        existingProgress.percent = 100;
      }
    },
  },
});

export const mp4ConversionActions = {
  ...mp4ConversionSlice.actions,
};

export { mp4ConversionSlice };
