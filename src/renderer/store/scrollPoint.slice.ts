import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./index";

interface ScrollPointState {
  [key: string]: number;
}

const initialState: ScrollPointState = {};

const scrollPointSlice = createSlice({
  name: "scrollPoint",
  initialState,
  reducers: {
    setScrollPoint: (
      state,
      action: PayloadAction<{ key: string; value: number }>
    ) => {
      state[action.payload.key] = action.payload.value;
    },
    clearScrollPoint: (state, action: PayloadAction<string>) => {
      delete state[action.payload];
    },
  },
});

export const { setScrollPoint, clearScrollPoint } = scrollPointSlice.actions;

export const selectScrollPoint = (state: RootState, key: string) =>
  state.scrollPoint[key];

export default scrollPointSlice.reducer;
