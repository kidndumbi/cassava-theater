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
  conversionQueue: {
    type: "array",
    default: [],
    items: {
      type: "object",
      properties: {
        inputPath: { type: "string" },
        status: { 
          type: "string",
          enum: ["pending", "processing", "completed", "failed", "paused"]
        },
        paused: { type: "boolean" }
      },
      required: ["inputPath", "status"]
    }
  }
};

let store: Store<SettingsModel>;

export const initializeStore = (): void => {
  store = new Store<SettingsModel>({ schema });
  subscribeToStoreChanges();
};

// Log store changes as they happen
const subscribeToStoreChanges = () => {
  store.onDidChange("conversionQueue", (newValue, oldValue) => {
    console.log("conversionQueue changed:", { oldValue, newValue });
  });
};

export const getValue = <K extends keyof SettingsModel>(
  key: K,
): SettingsModel[K] => {
  console.log(`Getting value for ${key}`);
  return store.get(key);
};

export const setValue = (
  key: keyof SettingsModel,
  value: SettingsModel[keyof SettingsModel],
): SettingsModel[keyof SettingsModel] => {
  console.log(`Setting value for ${key}:`, value);
  store.set(key, value);
  return value;
};

export const getAllValues = (): SettingsModel => {
  return store.store;
};