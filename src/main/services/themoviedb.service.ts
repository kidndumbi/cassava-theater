import axios from "axios";
import * as settingsDataDbService from "../services/settingsDataDb.service";
const BASE_URL = "https://api.themoviedb.org/3";

interface RequestOptions {
  headers: {
    Authorization: string;
  };
  params?: Record<string, string | boolean | number>;
}

const createRequestConfig = (authorization: string): RequestOptions => ({
  headers: {
    Authorization: `Bearer ${authorization}`,
  },
});

const makeRequest = async <T>(
  url: string,
  authorization: string,
  params?: Record<string, string | boolean | number>
): Promise<T> => {
  const response = await axios.get<T>(url, {
    ...createRequestConfig(authorization),
    params: {
      language: "en-US",
      ...params,
    },
  });
  return response.data;
};

export const getMovieOrTvShowById = async <T>(
  id: string,
  queryType: "movie" | "tv" = "movie",
): Promise<T> => {
  const url = `${BASE_URL}/${queryType}/${id}`;
  const authorization = await settingsDataDbService.getSetting("theMovieDbApiKey") as string;
  const appendToResponse = queryType === "tv" ? "aggregate_credits" : "credits";
  return makeRequest<T>(url, authorization, { append_to_response: appendToResponse });
};

export const getMoviesOrTvShowsByQuery = async <T>(
  query: string,
  queryType: "movie" | "tv" = "movie",
): Promise<T[]> => {
  const url = `${BASE_URL}/search/${queryType}`;
  const authorization = await settingsDataDbService.getSetting("theMovieDbApiKey") as string;
  const response = await makeRequest<{ results: T[] }>(
    url,
    authorization,
    {
      query,
      include_adult: false,
      page: 1,
    }
  );
  return response.results;
};