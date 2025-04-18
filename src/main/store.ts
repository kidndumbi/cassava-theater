import Store, { Schema } from "electron-store";
import { SettingsModel } from "../models/settings.model";

const schema: Schema<SettingsModel> = {
  movieFolderPath: {
    type: "string",
    default: "",
  },
  tvShowsFolderPath: {
    type: "string",
    default: "",
  },
  port: {
    type: "string",
    default: "",
  },
  folders: {
    type: "array",
    default: [],
  },
  continuousPlay: {
    type: "boolean",
    default: false,
  },
  showVideoType: {
    type: "boolean",
    default: true,
  },
  theMovieDbApiKey: {
    type: "string",
    default: "",
  },
};

let store: Store<SettingsModel>;

export const initializeStore = (): void => {
  store = new Store<SettingsModel>({ schema });
};

export const getValue = <K extends keyof SettingsModel>(
  key: K,
): SettingsModel[K] => {
  return store.get(key);
};

export const setValue = (
  key: keyof SettingsModel,
  value: SettingsModel[keyof SettingsModel],
): SettingsModel[keyof SettingsModel] => {
  store.set(key, value);
  return value;
};

export const getAllValues = (): SettingsModel => {
  return store.store;
};
