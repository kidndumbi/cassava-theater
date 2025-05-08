import { MovieDetails } from "../../models/movie-detail.model";

export const useMovies = () => {
  const getExtraMovieDetails = async (
    filePath: string,
    movie_details: MovieDetails,
  ) => {
    const extraMovieDetails = await window.theMovieDbAPI.movieOrTvShow(
      movie_details.id.toString(),
      "movie",
    );

    return extraMovieDetails;
  };

  return {
    getExtraMovieDetails,
  };
};
