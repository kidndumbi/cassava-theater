import { SettingsModel } from "../../models/settings.model";
import { levelDBService, KeyType } from "./levelDB.service";

const SETTINGS_KEY: KeyType = "main";
const SETTINGS_COLLECTION = "settings";

export const getAllSettings = async (): Promise<SettingsModel | null> => {
  return levelDBService.get(
    SETTINGS_COLLECTION,
    SETTINGS_KEY,
  ) as Promise<SettingsModel | null>;
};

export const setAllSettings = async (
  settings: SettingsModel,
): Promise<void> => {
  await levelDBService.put(SETTINGS_COLLECTION, SETTINGS_KEY, settings);
};

export const getSetting = async <K extends keyof SettingsModel>(
  key: K,
): Promise<SettingsModel[K] | undefined> => {
  const settings = await getAllSettings();
  return settings ? settings[key] : undefined;
};

export const setSetting = async <K extends keyof SettingsModel>(
  key: K,
  value: SettingsModel[K],
): Promise<SettingsModel[K]> => {
  const settings = await getAllSettings();
  settings[key] = value;
  await setAllSettings(settings);
  return value;
};
