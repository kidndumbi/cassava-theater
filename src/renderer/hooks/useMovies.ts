import { MovieDetails } from "../../models/movie-detail.model";
import { VideoDataModel } from "../../models/videoData.model";
import { fetchFilmDataByIdApi } from "../api/theMovieDb.api";
import { updateVideoData } from "../api/videoData.api";

export const useMovies = () => {
  const updateTMDBId = async (
    filePath: string,
    movie_details: MovieDetails,
  ) => {
    const extraMovieDetails = await fetchFilmDataByIdApi(
      movie_details.id.toString(),
      "movie",
    );

    await updateVideoData({
      currentVideo: { filePath: filePath },
      newVideoJsonData: { movie_details: extraMovieDetails },
    });
  };

  const updateWatchLater = async (filePath: string, watchLater: boolean) => {
    await updateVideoData({
      currentVideo: { filePath },
      newVideoJsonData: { watchLater },
    });
  };

  const updateMovieDbData = async (filePath: string, data: VideoDataModel) => {
    await updateVideoData({
      currentVideo: { filePath },
      newVideoJsonData: data,
    });
  };

  return {
    updateTMDBId,
    updateWatchLater,
    updateMovieDbData,
  };
};
