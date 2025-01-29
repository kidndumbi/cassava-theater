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
  appUrl: {
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
};

let store: Store<SettingsModel>;

export const initializeStore = (): void => {
  store = new Store<SettingsModel>({ schema });
};

export const getValue = (key: keyof SettingsModel): any => {
  return store.get(key);
};

export const setValue = (key: keyof SettingsModel, value: any): any => {
  store.set(key, value);
  return value;
};

export const getAllValues = (): SettingsModel => {
  return store.store;
};
