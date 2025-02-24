import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./index";
import { VideoDataModel } from "../../models/videoData.model";
import { rendererLoggingService as log } from "../util/renderer-logging.service";

const folderVideosInfoSlice = createSlice({
  name: "folderVideosInfo",
  initialState: {
    folderVideosInfo: [],
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
  } as {
    folderVideosInfo: VideoDataModel[];
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
  },
  reducers: {
    resetFolderVideosInfo: (state) => {
      state.folderVideosInfo = [];
    },
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
    updateTvShow: (state, action: PayloadAction<VideoDataModel>) => {
      const tvShow = action.payload;
      const idx = state.tvShows.findIndex(
        (m) => m.filePath.replace(/\\/g, "/") === tvShow.filePath
      );
      if (idx !== -1) {
        state.tvShows[idx] = { ...state.tvShows[idx], ...tvShow };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVideoData.pending, (state, action) => {
        if (action.meta.arg.category === "movies") {
          state.loadingMovies = true;
        } else if (action.meta.arg.category === "tvShows") {
          state.loadingTvShows = true;
        } else if (action.meta.arg.category === "episodes") {
          state.loadingEpisodes = true;
        } else if (action.meta.arg.category === "customFolder") {
          state.loadingCustomFolder = true;
        }
      })
      .addCase(fetchVideoData.fulfilled, (state, action) => {
        switch (action.payload.category) {
          case "movies":
            state.movies = action.payload.data;
            state.loadingMovies = false;
            break;
          case "tvShows":
            state.tvShows = action.payload.data;
            state.loadingTvShows = false;
            break;
          case "episodes":
            state.episodes = action.payload.data;
            state.loadingEpisodes = false;
            break;
          case "customFolder":
            state.customFolderData = action.payload.data;
            state.loadingCustomFolder = false;
            break;
        }
      })
      .addCase(fetchVideoData.rejected, (state, action) => {
        if (action.meta.arg.category === "movies") {
          state.loadingMovies = false;
        } else if (action.meta.arg.category === "tvShows") {
          state.loadingTvShows = false;
        } else if (action.meta.arg.category === "episodes") {
          state.loadingEpisodes = false;
        } else if (action.meta.arg.category === "customFolder") {
          state.loadingCustomFolder = false;
        }
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
      });
  },
});

const fetchVideoData = createAsyncThunk(
  "folderVideosInfo/fetchVideoData",
  async (
    {
      path,
      category,
      searchText,
      includeThumbnail = false,
    }: {
      path: string;
      category: string;
      searchText?: string;
      includeThumbnail?: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      if (!path) {
        return {
          category,
          data: [],
        };
      }

      const response = await window.videoAPI.fetchVideoData({
        filePath: path,
        searchText,
        includeThumbnail,
        category,
      });

      return {
        category,
        data: response,
      };
    } catch (error) {
      log.error("Error fetching video data:", error);
      return rejectWithValue(error);
    }
  }
);

const fetchVideoDetailsApi = async ({
  path,
  category,
}: {
  path: string;
  category: string;
}) => {
  try {
    if (!path) {
      log.error("Path is undefined");
      return {};
    }

    const response = window.videoAPI.fetchVideoDetails({ path, category });

    return response;
  } catch (error) {
    log.error("Error fetching video details via API:", error);
    throw error;
  }
};

const fetchVideoDetails = createAsyncThunk(
  "folderVideosInfo/fetchVideoDetails",
  async (args: { path: string; category: string }, { rejectWithValue }) => {
    try {
      const data = await fetchVideoDetailsApi(args);
      return data;
    } catch (error) {
      log.error("Error fetching video details:", error);
      return rejectWithValue(error);
    }
  }
);

const fetchFolderDetails = createAsyncThunk(
  "folderVideosInfo/fetchFolderDetails",
  async ({ path }: { path: string }, { rejectWithValue }) => {
    try {
      const response = await window.videoAPI.fetchFolderDetails({ path });
      return response;
    } catch (error) {
      log.error("Error fetching folder details:", error);
      return rejectWithValue(error);
    }
  }
);

const postVideoJason = createAsyncThunk(
  "folderVideosInfo/postVideoJason",
  async ({
    currentVideo,
    newVideoJsonData,
  }: {
    currentVideo: VideoDataModel | undefined;
    newVideoJsonData: VideoDataModel | undefined;
  }) => {
    try {
      return await window.videoAPI.saveVideoJsonData({
        currentVideo,
        newVideoJsonData,
      });
    } catch (error) {
      log.error("Failed to post video JSON data:", error);
      throw error;
    }
  }
);

const convertSrtToVtt = async (srt: string) => {
  try {
    return await window.fileManagerAPI.convertSrtToVtt(srt);
  } catch (error) {
    log.error("Error converting SRT to VTT:", error);
    throw error;
  }
};

const selFoldersVideosInfo = (state: RootState) =>
  state.folderVideosInfo.folderVideosInfo;

const selMovies = (state: RootState) => state.folderVideosInfo.movies;
const selTvShows = (state: RootState) => state.folderVideosInfo.tvShows;
const selEpisodes = (state: RootState) => state.folderVideosInfo.episodes;
const selVideoDetails = (state: RootState) =>
  state.folderVideosInfo.VideoDetails;
const selFolderDetails = (state: RootState) =>
  state.folderVideosInfo.folderDetails;
const selCustomFolder = (state: RootState) =>
  state.folderVideosInfo.customFolderData;
const selLoadingFolderVideosInfo = (state: RootState) =>
  state.folderVideosInfo.loadingFolderVideosInfo;
const selLoadingMovies = (state: RootState) =>
  state.folderVideosInfo.loadingMovies;
const selLoadingTvShows = (state: RootState) =>
  state.folderVideosInfo.loadingTvShows;
const selLoadingEpisodes = (state: RootState) =>
  state.folderVideosInfo.loadingEpisodes;
const selLoadingVideoDetails = (state: RootState) =>
  state.folderVideosInfo.loadingVideoDetails;
const selLoadingFolderDetails = (state: RootState) =>
  state.folderVideosInfo.loadingFolderDetails;
const selLoadingCustomFolder = (state: RootState) =>
  state.folderVideosInfo.loadingCustomFolder;

const folderVideosInfoActions = {
  fetchVideoData,
  fetchVideoDetails,
  fetchFolderDetails,
  ...folderVideosInfoSlice.actions,
  postVideoJason,
};

export {
  folderVideosInfoSlice,
  folderVideosInfoActions,
  selFoldersVideosInfo,
  selMovies,
  selTvShows,
  selEpisodes,
  selVideoDetails,
  selLoadingFolderVideosInfo,
  selLoadingMovies,
  selLoadingTvShows,
  selLoadingEpisodes,
  selLoadingVideoDetails,
  selFolderDetails,
  selLoadingFolderDetails,
  selCustomFolder,
  selLoadingCustomFolder,
  fetchVideoDetailsApi,
  convertSrtToVtt,
};
