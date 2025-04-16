import { RootState } from "../index";

export const selMovies = (state: RootState) => state.folderVideosInfo.movies;
export const selTvShows = (state: RootState) => state.folderVideosInfo.tvShows;
export const selEpisodes = (state: RootState) =>
  state.folderVideosInfo.episodes;
export const selVideoDetails = (state: RootState) =>
  state.folderVideosInfo.VideoDetails;
export const selFolderDetails = (state: RootState) =>
  state.folderVideosInfo.folderDetails;
export const selCustomFolder = (state: RootState) =>
  state.folderVideosInfo.customFolderData;
export const selLoadingFolderVideosInfo = (state: RootState) =>
  state.folderVideosInfo.loadingFolderVideosInfo;
export const selLoadingMovies = (state: RootState) =>
  state.folderVideosInfo.loadingMovies;
export const selLoadingTvShows = (state: RootState) =>
  state.folderVideosInfo.loadingTvShows;
export const selLoadingEpisodes = (state: RootState) =>
  state.folderVideosInfo.loadingEpisodes;
export const selLoadingVideoDetails = (state: RootState) =>
  state.folderVideosInfo.loadingVideoDetails;
export const selLoadingFolderDetails = (state: RootState) =>
  state.folderVideosInfo.loadingFolderDetails;
export const selLoadingCustomFolder = (state: RootState) =>
  state.folderVideosInfo.loadingCustomFolder;
export const selConvertToMp4Progress = (state: RootState) =>
  state.folderVideosInfo.convertToMp4Progress;
