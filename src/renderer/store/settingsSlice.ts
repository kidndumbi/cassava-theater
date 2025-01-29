import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./index";
import { SettingsModel } from "../../models/settings.model";
import { SettingsIpcChannels } from "../../enums/settings-IPC-channels.enum";

interface SettingsState {
  settings: SettingsModel | null;
}

const initialState: SettingsState = {
  settings: null,
};

const getAllSettings = createAsyncThunk(
  "settings/getSetting",
  async (): Promise<SettingsModel> => {
    return await window.settingsAPI.getALLSettings();
  }
);

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(
      getAllSettings.fulfilled,
      (state, action: PayloadAction<SettingsModel>) => {
        state.settings = action.payload;
      }
    );
  },
});

const settingsActions = {
  getAllSettings,
  //   setSetting,
};

const selSettings = (state: RootState) => state.settings.settings;

export { settingsActions, settingsSlice, selSettings };
