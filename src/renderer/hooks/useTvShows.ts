import { AddTvShowFolder } from "../components/tv-shows/addTvShow/AddTvShowFolder";
import { useSelector } from "react-redux";
import { videosInfoActions } from "../store/videoInfo/folderVideosInfo.slice";
import { useAppDispatch } from "../store";
import { settingsActions } from "../store/settingsSlice";
import {
  fetchFilmDataById,
  selTvShowSuggestions,
  selTvShowSuggestionsLoading,
  theMovieDbActions,
} from "../store/theMovieDb.slice";
import { TvShowDetails } from "../../models/tv-show-details.model";
import { VideoDataModel } from "../../models/videoData.model";
import {
  fetchFolderDetails,
  fetchVideoData,
  postVideoJason,
  addTvShowFolder,
} from "../store/videoInfo/folderVideosInfoActions";
import {
  selEpisodes,
  selFolderDetails,
  selLoadingEpisodes,
  selLoadingFolderDetails,
  selLoadingTvShows,
  selTvShows,
} from "../store/videoInfo/folderVideosInfoSelectors";
import { fetchVideoDetailsApi } from "../store/videoInfo/folderVideosInfoApi";
import {
  selThumbnailCache,
  thumbnailCacheActions,
} from "../store/thumbnailCache.slice";

export const useTvShows = () => {
  const dispatch = useAppDispatch();
  const tvShows = useSelector(selTvShows);
  const episodes = useSelector(selEpisodes);
  const loadingEpisodes = useSelector(selLoadingEpisodes);
  const tvShowDetails = useSelector(selFolderDetails);
  const loadingFolderDetails = useSelector(selLoadingFolderDetails);
  const loadingTvShows = useSelector(selLoadingTvShows);
  const tvShowSuggestions = useSelector(selTvShowSuggestions);
  const tvShowSuggestionsLoading = useSelector(selTvShowSuggestionsLoading);
  const thumbnailCache = useSelector(selThumbnailCache);

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
    const extraTvShowDetails = await fetchFilmDataById(
      tv_show_details.id.toString(),
      "tv",
    );
    await dispatch(
      postVideoJason({
        currentVideo: { filePath },
        newVideoJsonData: { tv_show_details: extraTvShowDetails },
      }),
    );

    updateTvShow({
      filePath,
      tv_show_details: { ...tv_show_details, ...extraTvShowDetails },
    });
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
    const tvShowTMDB = await fetchFilmDataById(id, "tv");
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
    const { filePath, currentTime } = episode;
    const cacheEntry = thumbnailCache[filePath];

    // Return cached thumbnail if it matches the current time
    if (cacheEntry?.currentTime === currentTime) {
      dispatchEpisodeUpdate(cacheEntry.image, filePath);
      return;
    }

    // Fetch new thumbnail details from the API
    const { videoProgressScreenshot } = await fetchVideoDetailsApi({
      path: filePath,
      category: null,
    });

    // Update the thumbnail cache
    dispatchThumbnailCacheUpdate(
      filePath,
      videoProgressScreenshot,
      currentTime,
    );

    // Dispatch the episode update with the new thumbnail
    dispatchEpisodeUpdate(videoProgressScreenshot, filePath);
  };

  // Helper function to dispatch episode updates
  const dispatchEpisodeUpdate = (image: string, filePath: string) => {
    dispatch(
      videosInfoActions.updateEpisode({
        videoProgressScreenshot: image,
        filePath,
      }),
    );
  };

  // Helper function to update the thumbnail cache
  const dispatchThumbnailCacheUpdate = (
    key: string,
    image: string,
    currentTime: number,
  ) => {
    dispatch(
      thumbnailCacheActions.setThumbnail({
        key,
        image,
        currentTime,
      }),
    );
  };

  const AddTvShowFolder = async (data: {
    tvShowName: string;
    subfolders: string[];
    tvShowDetails: TvShowDetails | null;
    tvShowsFolderPath: string;
  }) => {
    await dispatch(addTvShowFolder(data));
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
    tvShowSuggestionsLoading,
    AddTvShowFolder,
  };
};
