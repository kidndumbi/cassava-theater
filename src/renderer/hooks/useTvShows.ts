import { useSelector } from "react-redux";
import { videosInfoActions } from "../store/videoInfo/folderVideosInfo.slice";
import { useAppDispatch } from "../store";
import { settingsActions } from "../store/settingsSlice";
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
import { fetchFilmDataByIdApi } from "../api/theMovieDb.api";

export const useTvShows = () => {
  const dispatch = useAppDispatch();
  const tvShows = useSelector(selTvShows);
  const episodes = useSelector(selEpisodes);
  const loadingEpisodes = useSelector(selLoadingEpisodes);
  const tvShowDetails = useSelector(selFolderDetails);
  const loadingFolderDetails = useSelector(selLoadingFolderDetails);
  const loadingTvShows = useSelector(selLoadingTvShows);

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

  const updateTvShowTMDBId = async (
    filePath: string,
    tv_show_details: TvShowDetails,
  ) => {
    const extraTvShowDetails = await fetchFilmDataByIdApi(
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
    updateTvShowTMDBId,
    findNextEpisode,
    updateTvShow,
    updateTvShowDbData,
    removeTvShow,
    AddTvShowFolder,
  };
};
