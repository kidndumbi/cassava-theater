import { TvShowDetails } from "../../models/tv-show-details.model";
import { VideoDataModel } from "../../models/videoData.model";
import { fetchFilmDataByIdApi } from "../api/theMovieDb.api";
import {
  addTvShowFolder,
  fetchVideoDetails,
} from "../api/videoData.api";

export const useTvShows = () => {
  const updateTvShowTMDBId = async (
    filePath: string,
    tv_show_details: TvShowDetails,
  ) => {
    const extraTvShowDetails = await fetchFilmDataByIdApi(
      tv_show_details.id.toString(),
      "tv",
    );

    await window.videoAPI.saveVideoJsonData({
      currentVideo: { filePath },
      newVideoJsonData: { tv_show_details: extraTvShowDetails },
    });

    return extraTvShowDetails;
  };

  const updateTvShowDbData = async (filePath: string, data: VideoDataModel) => {
    await window.videoAPI.saveVideoJsonData({
      currentVideo: { filePath },
      newVideoJsonData: data,
    });
  };

  const getSingleEpisodeDetails = (path: string, category: string) => {
    return fetchVideoDetails({ path, category });
  };

  const AddTvShowFolder = async (data: {
    tvShowName: string;
    subfolders: string[];
    tvShowDetails: TvShowDetails | null;
    tvShowsFolderPath: string;
    poster: string;
    backdrop: string;
  }) => {
    return await addTvShowFolder(data);
  };

  return {
    getSingleEpisodeDetails,
    updateTvShowTMDBId,
    updateTvShowDbData,
    AddTvShowFolder,
  };
};
