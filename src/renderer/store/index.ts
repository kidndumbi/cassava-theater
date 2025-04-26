import { configureStore } from "@reduxjs/toolkit";
import { useDispatch } from "react-redux";
import { settingsSlice } from "./settingsSlice";
import { videoPlayerSlice } from "./videoPlayer.slice";
import { mp4ConversionSlice } from "./mp4Conversion/mp4Conversion.slice";

const store = configureStore({
  reducer: {
    videoPlayer: videoPlayerSlice.reducer,
    settings: settingsSlice.reducer,
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
