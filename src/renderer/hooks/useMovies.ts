import { MovieDetails } from "../../models/movie-detail.model";

export const useMovies = () => {
  const updateTMDBId = async (
    filePath: string,
    movie_details: MovieDetails,
  ) => {
    const extraMovieDetails = await window.theMovieDbAPI.movieOrTvShow(
      movie_details.id.toString(),
      "movie",
    );

    await window.videoAPI.saveVideoJsonData({
      currentVideo: { filePath: filePath },
      newVideoJsonData: { movie_details: extraMovieDetails },
    });
    return extraMovieDetails;
  };

  return {
    updateTMDBId,
  };
};
