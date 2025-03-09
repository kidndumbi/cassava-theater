import { useSelector } from "react-redux";
import {
  videosInfoActions,

} from "../store/videoInfo/folderVideosInfo.slice";
import { useAppDispatch } from "../store";
import { settingsActions } from "../store/settingsSlice";
import {
  fetchTvShowById,
  selTvShowSuggestions,
  theMovieDbActions,
} from "../store/theMovieDb.slice";
import { TvShowDetails } from "../../models/tv-show-details.model";
import { VideoDataModel } from "../../models/videoData.model";
import { fetchFolderDetails, fetchVideoData, postVideoJason } from "../store/videoInfo/folderVideosInfoActions";
import { selEpisodes, selFolderDetails, selLoadingEpisodes, selLoadingFolderDetails, selLoadingTvShows, selTvShows } from "../store/videoInfo/folderVideosInfoSelectors";
import { fetchVideoDetailsApi } from "../store/videoInfo/folderVideosInfoApi";

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
    includeThumbnail = false,
  ) => {
    dispatch(
      fetchVideoData({
        path,
        category,
        includeThumbnail,
      }),
    );
  };

  const findNextEpisode = (currentFilePath: string) => {
    const currentIndex = episodes.findIndex(
      (episode) => episode.filePath === currentFilePath,
    );
    if (currentIndex !== -1 && currentIndex < episodes.length - 1) {
      return episodes[currentIndex + 1];
    }
    return null;
  };

  const getTvShows = async () => {
    const tvShowsFolderPath = await dispatch(
      settingsActions.getSetting("tvShowsFolderPath"),
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
    tv_show_details: TvShowDetails,
  ) => {
    const extraTvShowDetails = await fetchTvShowById(
      tv_show_details.id.toString(),
    );
    await dispatch(
      postVideoJason({
        currentVideo: { filePath },
        newVideoJsonData: { tv_show_details: extraTvShowDetails },
      }),
    );
  };

  const updateTvShowDbData = async (filePath: string, data: VideoDataModel) => {
    await dispatch(
      postVideoJason({
        currentVideo: { filePath },
        newVideoJsonData: data,
      }),
    );
  };

  const updateSeasonTMDBId = (season_id: string, filePath: string) => {
    dispatch(
      postVideoJason({
        currentVideo: { filePath },
        newVideoJsonData: { season_id },
      }),
    );
  };

  const getTvShowById = async (
    id: string,
    callback: (data: TvShowDetails) => void,
  ) => {
    const tvShowTMDB = await fetchTvShowById(id);
    callback(tvShowTMDB);
  };

  const getEpisodeDetails = async (path: string) => {
    fetchData(path, "episodes", false);
  };

  const getSeasonDetails = (path: string) => {
    dispatch(
      fetchFolderDetails({
        path,
      }),
    );
  };

  const getSingleEpisodeDetails = (path: string, category: string) => {
    return fetchVideoDetailsApi({ path, category });
  };

  const resetTvShows = () => {
    dispatch(videosInfoActions.resetTvShows());
  };

  const resetEpisodes = () => {
    dispatch(videosInfoActions.resetEpisodes());
  };

  const resetTvShowDetails = () => {
    dispatch(videosInfoActions.resetFolderDetails());
  };

  const updateTvShow = (tvShow: VideoDataModel) => {
    dispatch(videosInfoActions.updateTvShow(tvShow));
  };

  const removeTvShow = (filePath: string) => {
    dispatch(videosInfoActions.removeTvShow(filePath));
  };

  const updateEpisodeThumbnail = async (episode: VideoDataModel) => {
    const { videoProgressScreenshot, filePath } = await fetchVideoDetailsApi({
      path: episode.filePath,
      category: null,
    });

    dispatch(
      videosInfoActions.updateEpisode({
        videoProgressScreenshot,
        filePath,
      }),
    );
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
    updateTvShow,
    updateTvShowDbData,
    removeTvShow,
    updateEpisodeThumbnail,
  };
};
