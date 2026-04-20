import { MovieDetails } from "../../models/movie-detail.model";

export const useMovies = () => {
  const getExtraMovieDetails = async (
    filePath: string,
    movie_details: MovieDetails,
  ) => {
    if (!movie_details.id) {
      throw new Error("Movie ID is required");
    }

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
