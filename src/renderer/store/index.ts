import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import { videoPlayerSlice } from "./videoPlayer.slice";
import scrollPointReducer from "./scrollPoint.slice";
import { youtubeDownloadSlice } from "./youtubeDownload.slice";
import { mp4ConversionNewSlice } from "./mp4ConversionNew.slice";
import { subtitleGenerationSlice } from "./subtitleGeneration.slice";
import { subtitleSyncSlice } from "./subtitleSync.slice";
import { chatHistorySlice } from "./chatHistory.slice";

const store = configureStore({
  reducer: {
    videoPlayer: videoPlayerSlice.reducer,
    scrollPoint: scrollPointReducer,
    youtubeDownload: youtubeDownloadSlice.reducer,
    mp4ConversionNew: mp4ConversionNewSlice.reducer,
    subtitleGeneration: subtitleGenerationSlice.reducer,
    subtitleSync: subtitleSyncSlice.reducer,
    chatHistory: chatHistorySlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // The HTMLVideoElement DOM node is stored in videoPlayer.videoPlayer
        // This is a known anti-pattern but requires significant refactoring to remove.
        // For now, ignore just that path so all other state gets serializability checks.
        ignoredPaths: ["videoPlayer.videoPlayer"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export function useAppDispatch() {
  return useDispatch<AppDispatch>();
}
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export { store };
