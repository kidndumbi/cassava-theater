import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import { videoPlayerSlice } from "./videoPlayer.slice";
import scrollPointReducer from "./scrollPoint.slice";
import { youtubeDownloadSlice } from "./youtubeDownload.slice";
import { mp4ConversionNewSlice } from "./mp4ConversionNew.slice";

const store = configureStore({
  reducer: {
    videoPlayer: videoPlayerSlice.reducer,
    scrollPoint: scrollPointReducer,
    youtubeDownload: youtubeDownloadSlice.reducer,
    mp4ConversionNew: mp4ConversionNewSlice.reducer,
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
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export { store };
