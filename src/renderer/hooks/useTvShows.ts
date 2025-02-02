import { useSelector } from "react-redux";
import {
  fetchVideoDetailsApi,
  folderVideosInfoActions,
  selEpisodes,
  selFolderDetails,
  selLoadingEpisodes,
  selLoadingFolderDetails,
  selLoadingTvShows,
  selTvShows,
} from "../store/folderVideosInfo.slice";
import { useAppDispatch } from "../store";
import { settingsActions } from "../store/settingsSlice";
import {
  fetchTvShowById,
  selTvShowSuggestions,
  theMovieDbActions,
} from "../store/theMovieDb.slice";
import { TvShowDetails } from "../../models/tv-show-details.model";

export const useTvShows = () => {
  const dispatch = useAppDispatch();
  const tvShows = useSelector(selTvShows);
  const episodes = useSelector(selEpisodes);
  const loadingEpisodes = useSelector(selLoadingEpisodes);
  const tvShowDetails = useSelector(selFolderDetails);
  const loadingFolderDetails = useSelector(selLoadingFolderDetails);
  const loadingTvShows = useSelector(selLoadingTvShows);
  const tvShowSuggestions = useSelector(selTvShowSuggestions);

  const fetchData = (
    path: string,
    category: "tvShows" | "episodes",
    includeThumbnail = false
  ) => {
    dispatch(
      folderVideosInfoActions.fetchVideoData({
        path,
        category,
        includeThumbnail,
      })
    );
  };

  const findNextEpisode = (currentFilePath: string) => {
    const currentIndex = episodes.findIndex(
      (episode) => episode.filePath === currentFilePath
    );
    if (currentIndex !== -1 && currentIndex < episodes.length - 1) {
      return episodes[currentIndex + 1];
    }
    return null;
  };

  const getTvShows = async () => {
    const tvShowsFolderPath = await dispatch(
      settingsActions.getSetting("tvShowsFolderPath")
    );
    fetchData(tvShowsFolderPath.payload, "tvShows");
  };

  const getTvShowSuggestions = (query: string) => {
    dispatch(theMovieDbActions.fetchTvShowSuggestions(query));
  };

  const resetTvShowSuggestions = () => {
    dispatch(theMovieDbActions.resetTvShowSuggestions());
  };

  const updateTvShowTMDBId = async (
    filePath: string,
    tv_show_details: TvShowDetails
  ) => {
    const extraTvShowDetails = await fetchTvShowById(
      tv_show_details.id.toString()
    );
    await dispatch(
      folderVideosInfoActions.postVideoJason({
        currentVideo: { filePath },
        newVideoJsonData: { tv_show_details: extraTvShowDetails },
      })
    );
  };

  const updateSeasonTMDBId = (season_id: string, filePath: string) => {
    dispatch(
      folderVideosInfoActions.postVideoJason({
        currentVideo: { filePath },
        newVideoJsonData: { season_id },
      })
    );
  };

  const getTvShowById = async (
    id: string,
    callback: (data: TvShowDetails) => void
  ) => {
    const tvShowTMDB = await fetchTvShowById(id);
    callback(tvShowTMDB);
  };

  const getEpisodeDetails = (path: string) => {
    fetchData(path, "episodes", true);
  };

  const getSeasonDetails = (path: string) => {
    dispatch(
      folderVideosInfoActions.fetchFolderDetails({
        path,
      })
    );
  };

  const getSingleEpisodeDetails = (path: string) => {
    return fetchVideoDetailsApi({ path });
  };

  const resetTvShows = () => {
    dispatch(folderVideosInfoActions.resetTvShows());
  };

  const resetEpisodes = () => {
    dispatch(folderVideosInfoActions.resetEpisodes());
  };

  const resetTvShowDetails = () => {
    dispatch(folderVideosInfoActions.resetFolderDetails());
  };

  return {
    tvShows,
    episodes,
    getTvShows,
    tvShowDetails,
    getSeasonDetails,
    loadingFolderDetails,
    getEpisodeDetails,
    loadingEpisodes,
    resetTvShows,
    resetEpisodes,
    resetTvShowDetails,
    getSingleEpisodeDetails,
    loadingTvShows,
    tvShowSuggestions,
    getTvShowSuggestions,
    resetTvShowSuggestions,
    updateTvShowTMDBId,
    getTvShowById,
    updateSeasonTMDBId,
    findNextEpisode,
  };
};
