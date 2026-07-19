import { contextBridge, ipcRenderer } from "electron";
import { TheMovieDbIPCChannels } from "../enums/TheMovieDbIPCChannels";
import { MovieDetails } from "../models/movie-detail.model";
import { TvShowDetails } from "../models/tv-show-details.model";

export function exposeTheMovieDbApi() {
  contextBridge.exposeInMainWorld("theMovieDbAPI", {
    search: (query: string, queryType: "movie" | "tv") =>
      ipcRenderer.invoke(TheMovieDbIPCChannels.Search, query, queryType) as Promise<MovieDetails[] | TvShowDetails[]>,
    movieOrTvShow: (id: string, queryType: "movie" | "tv") =>
      ipcRenderer.invoke(TheMovieDbIPCChannels.MovieOrTvShow, id, queryType) as Promise<MovieDetails | TvShowDetails>,
  });
}