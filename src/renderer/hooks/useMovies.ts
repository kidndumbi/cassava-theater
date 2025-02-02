import { useSelector } from "react-redux";
import {
  folderVideosInfoActions,
  selLoadingMovies,
  selLoadingVideoDetails,
  selMovies,
  selVideoDetails,
} from "../store/folderVideosInfo.slice";
import { useAppDispatch } from "../store";
import { settingsActions } from "../store/settingsSlice";
import {
  selMovieSuggestions,
  theMovieDbActions,
} from "../store/theMovieDb.slice";
import { MovieDetails } from "../../models/movie-detail.model";

export const useMovies = () => {
  const dispatch = useAppDispatch();
  const movies = useSelector(selMovies);
  const videoDetails = useSelector(selVideoDetails);
  const loadingVideoDetails = useSelector(selLoadingVideoDetails);
  const loadingMovies = useSelector(selLoadingMovies);
  const movieSuggestions = useSelector(selMovieSuggestions);

  const fetchMovies = async (path: string) => {
    dispatch(
      folderVideosInfoActions.fetchVideoData({
        path,
        category: "movies",
        includeThumbnail: false,
      })
    );
  };

  const getMovies = async () => {
    const movieFolderPath = await dispatch(
      settingsActions.getSetting("movieFolderPath")
    );

    await fetchMovies(movieFolderPath.payload);
  };

  const getMovieSuggestions = async (query: string) => {
    dispatch(theMovieDbActions.fetchMovieSuggestions(query));
  };

  const resetMovieSuggestions = () => {
    dispatch(theMovieDbActions.resetMovieSuggestions());
  };

  const updateTMDBId = async (
    filePath: string,
    movie_details: MovieDetails
  ) => {
    await dispatch(
      folderVideosInfoActions.postVideoJason({
        currentVideo: { filePath },
        newVideoJsonData: { movie_details },
      })
    );
  };

  const getVideoDetails = async (path: string) => {
    dispatch(
      folderVideosInfoActions.fetchVideoDetails({
        path,
      })
    );
  };

  return {
    movies,
    getMovies,
    videoDetails,
    getVideoDetails,
    loadingVideoDetails,
    loadingMovies,
    movieSuggestions,
    getMovieSuggestions,
    resetMovieSuggestions,
    updateTMDBId,
  };
};
