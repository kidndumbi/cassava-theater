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
  showVideoType: boolean;
  theMovieDbApiKey: string;
  playNonMp4Videos: boolean;
  notifications: {
    mp4ConversionStatus: boolean;
    userConnectionStatus: boolean;
    youtubeDownloadStatus?: boolean;
  };
}
