import { RootState } from "../index";

export const selConvertToMp4Progress = (state: RootState) =>
  state.mp4Conversion.convertToMp4Progress;
export const selCurrentlyProcessingItem = (state: RootState) =>
  state.mp4Conversion.currentlyProcessingItem;
