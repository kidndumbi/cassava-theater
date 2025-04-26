import { MovieDetails } from "../../models/movie-detail.model";
import { TvShowDetails } from "../../models/tv-show-details.model";

const getAuthorization = async () => {
  return (await window.settingsAPI.getSetting("theMovieDbApiKey")) as string;
};

export const fetchMovieSuggestionsApi = async (query: string): Promise<MovieDetails[]> => {
  const authorization = await getAuthorization();
  return await window.theMovieDbAPI.search(query, "movie", authorization);
};

export const fetchTvShowSuggestionsApi = async (query: string): Promise<TvShowDetails[]> => {
  const authorization = await getAuthorization();
  return await window.theMovieDbAPI.search(query, "tv", authorization);
};

export const fetchFilmDataByIdApi = async (id: string, queryType: "movie" | "tv"): Promise<TvShowDetails> => {
  const authorization = await getAuthorization();
  return await window.theMovieDbAPI.movieOrTvShow(id, queryType, authorization);
};