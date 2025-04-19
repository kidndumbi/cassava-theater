import { ConversionQueueItem } from "../main/services/mp4Conversion.service";

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
  conversionQueue: ConversionQueueItem[]; // Add this line
}
