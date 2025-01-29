import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./index";
import { SettingsModel } from "../../models/settings.model";

interface SettingsState {
  settings: SettingsModel | null;
}

const initialState: SettingsState = {
  settings: null,
};

const getAllSettings = createAsyncThunk(
  "settings/getAllSettings",
  async (): Promise<SettingsModel> => {
    return await window.settingsAPI.getALLSettings();
  }
);

const getSetting = createAsyncThunk(
  "settings/getSetting",
  async (key: keyof SettingsModel) => {
    return await window.settingsAPI.getSetting(key);
  }
);

const setSetting = createAsyncThunk(
  "settings/setSetting",
  async ({ key, value }: { key: keyof SettingsModel; value: any }) => {
    return await window.settingsAPI.setSetting(key, value);
  }
);

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(
        getAllSettings.fulfilled,
        (state, action: PayloadAction<SettingsModel>) => {
          state.settings = action.payload;
        }
      )
      .addCase(getSetting.fulfilled, (state, action) => {
        state.settings = {
          ...state.settings,
          [action.meta.arg]: action.payload,
        };
      })
      .addCase(setSetting.fulfilled, (state, action) => {
        state.settings = {
          ...state.settings,
          [action.meta.arg.key]: action.payload,
        };
      });
  },
});

const settingsActions = {
  getAllSettings,
  getSetting,
  setSetting,
};

const selSettings = (state: RootState) => state.settings.settings;

export { settingsActions, settingsSlice, selSettings };
