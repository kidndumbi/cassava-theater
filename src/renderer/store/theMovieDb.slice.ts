import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from ".";
import { MovieDetails } from "../../models/movie-detail.model";
import { TvShowDetails } from "../../models/tv-show-details.model";
import { ipcRenderer } from "electron";
import { TheMovieDbIPCChannels } from "../../enums/TheMovieDbIPCChannels";

const fetchMovieSuggestions = createAsyncThunk(
  "theMovieDb/fetchMovieSuggestions",
  async (query: string) => {
    // const response = await ipcRenderer.invoke(
    //   TheMovieDbIPCChannels.Search,
    //   query,
    //   "movie"
    // );
    const response: any = [];
    return response;
  }
);

const fetchTvShowSuggestions = createAsyncThunk(
  "theMovieDb/fetchTvShowSuggestions",
  async (query: string) => {
    // const response = await ipcRenderer.invoke(
    //   TheMovieDbIPCChannels.Search,
    //   query,
    //   "tv"
    // );
    const response: any = [];
    return response;
  }
);

const fetchTvShowById = async (id: string) => {
  // const response = await ipcRenderer.invoke(
  //   TheMovieDbIPCChannels.MovieOrTvShow,
  //   id,
  //   "tv"
  // );
  const response: any = {};

  return response as TvShowDetails;
};

const theMovieDbSlice = createSlice({
  name: "theMovieDb",
  initialState: {
    movieSuggestions: [],
    tvShowSuggestions: [],
    movieSuggestionsLoading: false,
    tvShowSuggestionsLoading: false,
  } as {
    movieSuggestions: MovieDetails[];
    tvShowSuggestions: TvShowDetails[];
    movieSuggestionsLoading: boolean;
    tvShowSuggestionsLoading: boolean;
  },
  reducers: {
    resetMovieSuggestions: (state) => {
      state.movieSuggestions = [];
    },
    resetTvShowSuggestions: (state) => {
      state.tvShowSuggestions = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMovieSuggestions.pending, (state) => {
        state.movieSuggestionsLoading = true;
      })
      .addCase(fetchMovieSuggestions.fulfilled, (state, action) => {
        state.movieSuggestions = action.payload;
        state.movieSuggestionsLoading = false;
      })
      .addCase(fetchMovieSuggestions.rejected, (state) => {
        state.movieSuggestionsLoading = false;
      })
      .addCase(fetchTvShowSuggestions.pending, (state) => {
        state.tvShowSuggestionsLoading = true;
      })
      .addCase(fetchTvShowSuggestions.fulfilled, (state, action) => {
        state.tvShowSuggestions = action.payload;
        state.tvShowSuggestionsLoading = false;
      })
      .addCase(fetchTvShowSuggestions.rejected, (state) => {
        state.tvShowSuggestionsLoading = false;
      });
  },
});

const selMovieSuggestions = (state: RootState) =>
  state.theMovieDb.movieSuggestions;

const selTvShowSuggestions = (state: RootState) =>
  state.theMovieDb.tvShowSuggestions;

const selMovieSuggestionsLoading = (state: RootState) =>
  state.theMovieDb.movieSuggestionsLoading;

const selTvShowSuggestionsLoading = (state: RootState) =>
  state.theMovieDb.tvShowSuggestionsLoading;

const theMovieDbActions = {
  fetchMovieSuggestions,
  fetchTvShowSuggestions,
  resetMovieSuggestions: theMovieDbSlice.actions.resetMovieSuggestions,
  resetTvShowSuggestions: theMovieDbSlice.actions.resetTvShowSuggestions,
};

export {
  theMovieDbSlice,
  theMovieDbActions,
  selMovieSuggestions,
  selTvShowSuggestions,
  selMovieSuggestionsLoading,
  selTvShowSuggestionsLoading,
  fetchTvShowById,
};
