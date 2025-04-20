import { configureStore } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import { folderVideosInfoSlice } from "./videoInfo/folderVideosInfo.slice";
import { settingsSlice } from "./settingsSlice";
import { videoPlayerSlice } from "./videoPlayer.slice";
import { theMovieDbReducer } from "./theMovieDb.slice";
import { mp4ConversionSlice } from "./mp4Conversion/mp4Conversion.slice";

const store = configureStore({
  reducer: {
    folderVideosInfo: folderVideosInfoSlice.reducer,
    videoPlayer: videoPlayerSlice.reducer,
    settings: settingsSlice.reducer,
    theMovieDb: theMovieDbReducer,
    mp4Conversion: mp4ConversionSlice.reducer,
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
