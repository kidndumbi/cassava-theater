import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import {
  fetchVideoData,
  fetchVideoDetails,
  fetchFolderDetails,
  postVideoJason,
  addTvShowFolder,
} from "./folderVideosInfoActions";
import { VideoDataModel } from "../../../models/videoData.model";

interface FolderVideosInfoState {
  movies: VideoDataModel[];
  tvShows: VideoDataModel[];
  customFolderData: VideoDataModel[];
  episodes: VideoDataModel[];
  VideoDetails: VideoDataModel | null;
  folderDetails: VideoDataModel | null;
  loadingFolderVideosInfo: boolean;
  loadingMovies: boolean;
  loadingTvShows: boolean;
  loadingEpisodes: boolean;
  loadingVideoDetails: boolean;
  loadingFolderDetails: boolean;
  loadingCustomFolder: boolean;
  loadingPostVideoJson: boolean;
  convertToMp4Progress: {
    fromPath: string;
    toPath: string;
    percent: number;
  }[];
}

const initialState: FolderVideosInfoState = {
  movies: [],
  tvShows: [],
  customFolderData: [],
  episodes: [],
  VideoDetails: null,
  folderDetails: null,
  loadingFolderVideosInfo: false,
  loadingMovies: false,
  loadingTvShows: false,
  loadingEpisodes: false,
  loadingVideoDetails: false,
  loadingFolderDetails: false,
  loadingCustomFolder: false,
  loadingPostVideoJson: false,
  convertToMp4Progress: [],
};

const folderVideosInfoSlice = createSlice({
  name: "folderVideosInfo",
  initialState,
  reducers: {
    resetMovies: (state) => {
      state.movies = [];
    },
    resetTvShows: (state) => {
      state.tvShows = [];
    },
    resetEpisodes: (state) => {
      state.episodes = [];
    },
    resetFolderDetails: (state) => {
      state.folderDetails = null;
    },
    resetCustomFolder: (state) => {
      state.customFolderData = [];
    },
    resetVideoDetails: (state) => {
      state.VideoDetails = null;
    },
    updateMovie: (state, action: PayloadAction<VideoDataModel>) => {
      const movie = action.payload;
      const idx = state.movies.findIndex((m) => m.filePath === movie.filePath);
      if (idx !== -1) {
        state.movies[idx] = { ...state.movies[idx], ...movie };
      }
    },
    removeMovie: (state, action: PayloadAction<string>) => {
      const filePath = action.payload;
      state.movies = state.movies.filter(
        (movie) => movie.filePath !== filePath,
      );
    },
    updateTvShow: (state, action: PayloadAction<VideoDataModel>) => {
      const tvShow = action.payload;
      const idx = state.tvShows.findIndex(
        (m) =>
          m.filePath.replace(/\\/g, "/") ===
          tvShow.filePath.replace(/\\/g, "/"),
      );
      if (idx !== -1) {
        state.tvShows[idx] = { ...state.tvShows[idx], ...tvShow };
      }
    },
    removeTvShow: (state, action: PayloadAction<string>) => {
      const filePath = action.payload;
      state.tvShows = state.tvShows.filter(
        (tvShow) => tvShow.filePath !== filePath,
      );
    },
    updateEpisode: (state, action: PayloadAction<VideoDataModel>) => {
      const episode = action.payload;
      const idx = state.episodes.findIndex(
        (m) => m.filePath.replace(/\\/g, "/") === episode.filePath,
      );
      if (idx !== -1) {
        state.episodes[idx] = { ...state.episodes[idx], ...episode };
      }
    },
    updateConvertToMp4Progress: (
      state,
      action: PayloadAction<{
        fromPath: string;
        toPath: string;
        percent: number;
      }>,
    ) => {
      const { fromPath, toPath, percent } = action.payload;
      const existingProgress = state.convertToMp4Progress.find(
        (progress) => progress.fromPath === fromPath,
      );
      if (!existingProgress) {
        state.convertToMp4Progress.push({
          fromPath,
          toPath,
          percent,
        });
      } else {
        existingProgress.percent = percent;
        existingProgress.toPath = toPath;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVideoData.pending, (state, action) => {
        const { category } = action.meta.arg;
        if (category === "movies") state.loadingMovies = true;
        else if (category === "tvShows") state.loadingTvShows = true;
        else if (category === "episodes") state.loadingEpisodes = true;
        else if (category === "customFolder") state.loadingCustomFolder = true;
      })
      .addCase(fetchVideoData.fulfilled, (state, action) => {
        const { category, data } = action.payload;
        switch (category) {
          case "movies":
            state.movies = data;
            state.loadingMovies = false;
            break;
          case "tvShows":
            state.tvShows = data;
            state.loadingTvShows = false;
            break;
          case "episodes":
            state.episodes = data;
            state.loadingEpisodes = false;
            break;
          case "customFolder":
            state.customFolderData = data;
            state.loadingCustomFolder = false;
            break;
        }
      })
      .addCase(fetchVideoData.rejected, (state, action) => {
        const { category } = action.meta.arg;
        if (category === "movies") state.loadingMovies = false;
        else if (category === "tvShows") state.loadingTvShows = false;
        else if (category === "episodes") state.loadingEpisodes = false;
        else if (category === "customFolder") state.loadingCustomFolder = false;
      })
      .addCase(fetchVideoDetails.pending, (state) => {
        state.loadingVideoDetails = true;
      })
      .addCase(fetchVideoDetails.fulfilled, (state, action) => {
        state.VideoDetails = action.payload;
        state.loadingVideoDetails = false;
      })
      .addCase(fetchVideoDetails.rejected, (state) => {
        state.loadingVideoDetails = false;
      })
      .addCase(fetchFolderDetails.pending, (state) => {
        state.loadingFolderDetails = true;
      })
      .addCase(fetchFolderDetails.fulfilled, (state, action) => {
        state.folderDetails = action.payload;
        state.loadingFolderDetails = false;
      })
      .addCase(fetchFolderDetails.rejected, (state) => {
        state.loadingFolderDetails = false;
      })
      .addCase(postVideoJason.pending, (state) => {
        state.loadingPostVideoJson = true;
      })
      .addCase(postVideoJason.fulfilled, (state) => {
        state.loadingPostVideoJson = false;
      })
      .addCase(addTvShowFolder.pending, (state) => {
        state.loadingTvShows = true;
      })
      .addCase(addTvShowFolder.fulfilled, (state, action) => {
        state.tvShows = [...state.tvShows, action.payload];
        state.loadingTvShows = false;
      })
      .addCase(addTvShowFolder.rejected, (state) => {
        state.loadingTvShows = false;
      });
  },
});

export const videosInfoActions = {
  ...folderVideosInfoSlice.actions,
};

export { folderVideosInfoSlice };
