import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ConversionQueueItem } from "../../models/conversion-queue-item.model";
import { RootState } from "./index";

const mp4ConversionNewSlice = createSlice({
  name: "mp4ConversionNew",
  initialState: {
    conversionProgress: [] as ConversionQueueItem[],
  },
  reducers: {
    setConversionProgress: (
      state,
      action: PayloadAction<ConversionQueueItem[]>,
    ) => {
      state.conversionProgress = action.payload;
    },
  },
});

const selConvertToMp4Progress = (state: RootState) =>
  state.mp4ConversionNew.conversionProgress;

const mp4ConversionNewActions = {
  ...mp4ConversionNewSlice.actions,
};

export {
  mp4ConversionNewSlice,
  mp4ConversionNewActions,
  selConvertToMp4Progress,
};
