import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux";
import { videoPlayerSlice } from "./videoPlayer.slice";
import { mp4ConversionSlice } from "./mp4Conversion/mp4Conversion.slice";
import scrollPointReducer from "./scrollPoint.slice"; // import reducer

const store = configureStore({
  reducer: {
    videoPlayer: videoPlayerSlice.reducer,
    mp4Conversion: mp4ConversionSlice.reducer,
    scrollPoint: scrollPointReducer, // add reducer
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
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; // add selector hook
export { store };
