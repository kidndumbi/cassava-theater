import { useSelector } from "react-redux";
import { useAppDispatch } from "../store";
import { settingsActions } from "../store/settingsSlice";
import { MovieDetails } from "../../models/movie-detail.model";
import { VideoDataModel } from "../../models/videoData.model";
import {
  selLoadingMovies,
  selLoadingVideoDetails,
  selMovies,
  selVideoDetails,
} from "../store/videoInfo/folderVideosInfoSelectors";
import {
  fetchVideoData,
  fetchVideoDetails,
  postVideoJason,
} from "../store/videoInfo/folderVideosInfoActions";
import { videosInfoActions } from "../store/videoInfo/folderVideosInfo.slice";
import { fetchFilmDataByIdApi } from "../api/theMovieDb.api";

export const useMovies = () => {
  const dispatch = useAppDispatch();
  const movies = useSelector(selMovies);
  const videoDetails = useSelector(selVideoDetails);
  const loadingVideoDetails = useSelector(selLoadingVideoDetails);
  const loadingMovies = useSelector(selLoadingMovies);

  const fetchMovies = async (path: string) => {
    dispatch(
      fetchVideoData({
        path,
        category: "movies",
        includeThumbnail: false,
      }),
    );
  };

  const getMovies = async () => {
    const movieFolderPath = await dispatch(
      settingsActions.getSetting("movieFolderPath"),
    );

    await fetchMovies(movieFolderPath.payload);
  };


  const resetMovieDetails = () => {
    dispatch(videosInfoActions.resetVideoDetails());
  };

  const updateTMDBId = async (
    filePath: string,
    movie_details: MovieDetails,
  ) => {
    const extraMovieDetails = await fetchFilmDataByIdApi(
      movie_details.id.toString(),
      "movie",
    );

    await dispatch(
      postVideoJason({
        currentVideo: { filePath },
        newVideoJsonData: { movie_details: extraMovieDetails },
      }),
    );

    updateMovie({
      filePath,
      movie_details: { ...movie_details, ...extraMovieDetails },
    });
  };

  const updateWatchLater = async (filePath: string, watchLater: boolean) => {
    await dispatch(
      postVideoJason({
        currentVideo: { filePath },
        newVideoJsonData: { watchLater },
      }),
    );
  };

  const getVideoDetails = async (path: string) => {
    dispatch(
      fetchVideoDetails({
        path,
        category: "movies",
      }),
    );
  };

  const updateMovieDbData = async (filePath: string, data: VideoDataModel) => {
    await dispatch(
      postVideoJason({
        currentVideo: { filePath },
        newVideoJsonData: data,
      }),
    );
  };

  const updateMovie = (movie: VideoDataModel) =>
    dispatch(videosInfoActions.updateMovie(movie));

  const removeMovie = (filePath: string) =>
    dispatch(videosInfoActions.removeMovie(filePath));

  return {
    movies,
    getMovies,
    videoDetails,
    getVideoDetails,
    loadingVideoDetails,
    loadingMovies,
    updateTMDBId,
    updateWatchLater,
    updateMovie,
    updateMovieDbData,
    resetMovieDetails,
    removeMovie,
  };
};
