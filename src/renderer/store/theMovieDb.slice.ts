import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from ".";
import { MovieDetails } from "../../models/movie-detail.model";
import { TvShowDetails } from "../../models/tv-show-details.model";

const fetchMovieSuggestions = createAsyncThunk(
  "theMovieDb/fetchMovieSuggestions",
  async (query: string) => {
    try {
      return await window.theMovieDbAPI.search(query, "movie");
    } catch (error) {
      console.error("Failed to fetch movie suggestions:", error);
      throw error;
    }
  }
);

const fetchTvShowSuggestions = createAsyncThunk(
  "theMovieDb/fetchTvShowSuggestions",
  async (query: string) => {
    try {
      return await window.theMovieDbAPI.search(query, "tv");
    } catch (error) {
      console.error("Failed to fetch TV show suggestions:", error);
      throw error;
    }
  }
);

const fetchTvShowById = async (id: string) => {
  try {
    return (await window.theMovieDbAPI.movieOrTvShow(
      id,
      "tv"
    )) as TvShowDetails;
  } catch (error) {
    console.error("Failed to fetch TV show by ID:", error);
    throw error;
  }
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
