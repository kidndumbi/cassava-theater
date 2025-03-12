import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from ".";
import { MovieDetails } from "../../models/movie-detail.model";
import { TvShowDetails } from "../../models/tv-show-details.model";

const getAuthorization = async () => {
  return (await window.settingsAPI.getSetting("theMovieDbApiKey")) as string;
};

const fetchMovieSuggestions = createAsyncThunk(
  "theMovieDb/fetchMovieSuggestions",
  async (query: string) => {
    try {
      const authorization = await getAuthorization();
      return await window.theMovieDbAPI.search(query, "movie", authorization);
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
      const authorization = await getAuthorization();
      return await window.theMovieDbAPI.search(query, "tv", authorization);
    } catch (error) {
      console.error("Failed to fetch TV show suggestions:", error);
      throw error;
    }
  }
);

const fetchTvShowById = async (id: string) => {
  try {
    const authorization = await getAuthorization();
    return (await window.theMovieDbAPI.movieOrTvShow(
      id,
      "tv",
      authorization
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
    movieSuggestionsError: null,
    tvShowSuggestionsError: null,
  } as {
    movieSuggestions: MovieDetails[];
    tvShowSuggestions: TvShowDetails[];
    movieSuggestionsLoading: boolean;
    tvShowSuggestionsLoading: boolean;
    movieSuggestionsError: string | null; 
    tvShowSuggestionsError: string | null;
  },
  reducers: {
    resetMovieSuggestions: (state) => {
      state.movieSuggestions = [];
      state.movieSuggestionsError = null;
    },
    resetTvShowSuggestions: (state) => {
      state.tvShowSuggestions = [];
      state.tvShowSuggestionsError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMovieSuggestions.pending, (state) => {
        state.movieSuggestionsLoading = true;
        state.movieSuggestionsError = null;
      })
      .addCase(fetchMovieSuggestions.fulfilled, (state, action) => {
        state.movieSuggestions = action.payload;
        state.movieSuggestionsLoading = false;
      })
      .addCase(fetchMovieSuggestions.rejected, (state, action) => {
        state.movieSuggestionsLoading = false;
        state.movieSuggestionsError = action.error.message || "Failed to fetch movie suggestions";
      })
      .addCase(fetchTvShowSuggestions.pending, (state) => {
        state.tvShowSuggestionsLoading = true;
        state.tvShowSuggestionsError = null;
      })
      .addCase(fetchTvShowSuggestions.fulfilled, (state, action) => {
        state.tvShowSuggestions = action.payload;
        state.tvShowSuggestionsLoading = false;
      })
      .addCase(fetchTvShowSuggestions.rejected, (state, action) => {
        state.tvShowSuggestionsLoading = false;
        state.tvShowSuggestionsError = action.error.message || "Failed to fetch TV show suggestions";
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
  ...theMovieDbSlice.actions,
};

export const theMovieDbReducer = theMovieDbSlice.reducer;

export {
  theMovieDbActions,
  selMovieSuggestions,
  selTvShowSuggestions,
  selMovieSuggestionsLoading,
  selTvShowSuggestionsLoading,
  fetchTvShowById,
};
