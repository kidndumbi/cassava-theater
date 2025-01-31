import { configureStore } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import { currentVideoSlice } from "./currentVideo.slice";
import { folderVideosInfoSlice } from "./folderVideosInfo.slice";
import { videoJsonSlice } from "./videoJson.slice";

import { settingsSlice } from "./settingsSlice";
import { theMovieDbSlice } from "./theMovieDb.slice";
import { videoPlayerSlice } from "./videoPlayer.slice";

const store = configureStore({
  reducer: {
    folderVideosInfo: folderVideosInfoSlice.reducer,
    videoJson: videoJsonSlice.reducer,
    currentVideo: currentVideoSlice.reducer,
    videoPlayer: videoPlayerSlice.reducer,
    settings: settingsSlice.reducer,
    theMovieDb: theMovieDbSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export function useAppDispatch() {
  return useDispatch<AppDispatch>();
}
export { store };
