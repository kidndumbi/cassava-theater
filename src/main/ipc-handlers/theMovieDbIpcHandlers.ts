import { ipcMain } from "electron";
import { TheMovieDbIPCChannels } from "../../enums/TheMovieDbIPCChannels";
import {
  getMovieOrTvShowById,
  getMoviesOrTvShowsByQuery,
} from "../services/themoviedb.service";
import { MovieDetails } from "../../models/movie-detail.model";
import { TvShowDetails } from "../../models/tv-show-details.model";

export const theMovieDbIpcHandlers = () => {
  ipcMain.handle(
    TheMovieDbIPCChannels.Search,
    (_event: Electron.IpcMainInvokeEvent, query: string, queryType: "movie" | "tv",   
    ) => {
      return getMoviesOrTvShowsByQuery<MovieDetails[] | TvShowDetails[]>(query, queryType, 
      );
    }
  );

  ipcMain.handle(
    TheMovieDbIPCChannels.MovieOrTvShow,
    (_event: Electron.IpcMainInvokeEvent, id: string, queryType: "movie" | "tv",   
    ) => {
      return getMovieOrTvShowById<MovieDetails | TvShowDetails>(id, queryType, 
      );
    }
  );
};
