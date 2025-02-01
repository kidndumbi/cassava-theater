export interface SettingsModel {
  movieFolderPath: string;
  tvShowsFolderPath: string;
  port: string;
  folders: Array<{
    id: string;
    name: string;
    folderPath: string;
  }>;
  continuousPlay: boolean;
}