import { ipcMain } from "electron";
import { TheMovieDbIPCChannels } from "../../enums/TheMovieDbIPCChannels";
import {
  getMovieOrTvShowById,
  getMoviesOrTvShowsByQuery,
} from "../services/themoviedb.service";

export const theMovieDbIpcHandlers = () => {
  ipcMain.handle(
    TheMovieDbIPCChannels.Search,
    (_event: any, query: string, queryType: "movie" | "tv") => {
      return getMoviesOrTvShowsByQuery(query, queryType);
    }
  );

  ipcMain.handle(
    TheMovieDbIPCChannels.MovieOrTvShow,
    (_event: any, id: string, queryType: "movie" | "tv") => {
      return getMovieOrTvShowById(id, queryType);
    }
  );
};
