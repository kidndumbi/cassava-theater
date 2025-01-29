export interface SettingsModel {
  movieFolderPath: string;
  tvShowsFolderPath: string;
  appUrl: string;
  folders: Array<{
    id: string;
    name: string;
    folderPath: string;
  }>;
  continuousPlay: boolean;
}