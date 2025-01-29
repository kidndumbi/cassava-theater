import { SettingsModel } from "./main/store";
export interface IElectronAPI {
  desktop: boolean;
}

export interface settingsAPI {
  getALLSettings: () => Promise<SettingsModel>;
  getSetting: (key: keyof SettingsModel) => Promise<SettingsModel[keyof SettingsModel]>;
  setSetting: (key: keyof SettingsModel, value: any) => Promise<void>;
}

declare global {
  interface Window {
    myAPI: IElectronAPI;
    settingsAPI: settingsAPI;
  }
}
