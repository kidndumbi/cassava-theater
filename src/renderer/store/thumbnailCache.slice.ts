import { RootState } from ".";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface ThumbnailCacheState {
  [key: string]: { image: string; currentTime: number };
}

const thumbnailCacheSlice = createSlice({
  name: "thumbnailCache",
  initialState: {} as ThumbnailCacheState,
  reducers: {
    setThumbnail: (
      state,
      action: PayloadAction<{
        key: string;
        image: string;
        currentTime: number;
      }>,
    ) => {
      state[action.payload.key] = {
        image: action.payload.image,
        currentTime: action.payload.currentTime,
      };
    },
    removeThumbnail: (state, action: PayloadAction<string>) => {
      delete state[action.payload];
    },
  },
});

export const selThumbnailCache = (state: RootState) => state.thumbnailCache;

export const thumbnailCacheActions = thumbnailCacheSlice.actions;
export const thumbnailCacheReducer = thumbnailCacheSlice.reducer;
