import { ipcMain } from "electron";
import { TheMovieDbIPCChannels } from "../../enums/TheMovieDbIPCChannels";
import { getMovieOrTvShowById, getMoviesOrTvShowsByQuery } from "../services/themoviedb.service";
import { MovieDetails } from "../../models/movie-detail.model";
import { TvShowDetails } from "../../models/tv-show-details.model";

export const registerTheMovieDbHandlers = {
  ipc(): void {
    ipcMain.handle(TheMovieDbIPCChannels.Search, async (_event, query: string, queryType: "movie" | "tv") => {
      return getMoviesOrTvShowsByQuery<MovieDetails[] | TvShowDetails[]>(query, queryType);
    });
    ipcMain.handle(TheMovieDbIPCChannels.MovieOrTvShow, async (_event, id: string, queryType: "movie" | "tv") => {
      return getMovieOrTvShowById<MovieDetails | TvShowDetails>(id, queryType);
    });
  },
  // No Socket.IO equivalent — desktop-only feature
};