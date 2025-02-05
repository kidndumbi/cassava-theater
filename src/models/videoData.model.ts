import { MovieDetails } from "./movie-detail.model";
import { NoteModel } from "./note.model";
import { OverviewModel } from "./overview.model";

import { TvShowDetails } from "./tv-show-details.model";

export interface VideoDataModel {
  fileName?: string;
  filePath?: string;
  isDirectory?: boolean;
  rootPath?: string;
  createdAt?: number;
  mustWatch?: boolean;
  notesCount?: number;
  watched?: boolean;
  like?: boolean;
  duration?: number;
  currentTime?: number;
  videoProgressScreenshot?: string;
  movie_details?: MovieDetails | null;
  tv_show_details?: TvShowDetails | null;
  season_id?: string | null;
  subtitlePath?: string | null;
  lastVideoPlayedDate?: string | null;
  lastVideoPlayed?: string | null;
  lastVideoPlayedTime?: number | null;
  lastVideoPlayedDuration?: number | null;
  overview?: OverviewModel;
  notes?: NoteModel[];
  lastWatched?: number;
  basePath?: string;
  childFolders?: {
    folderPath: string;
    basename: string;
    season_id?: string | null;
  }[];
  isMkv?: boolean;
  watchLater?: boolean;
}
