import axios from "axios";

const apiUrl = "https://api.themoviedb.org/3";

export const getMovieOrTvShowById = async <T>(
  id: string,
  queryType: "movie" | "tv" = "movie",
  authorization: string
): Promise<T> => {
  const response = await axios.get<T>(
    `${apiUrl}/${queryType}/${id}?language=en-US`,
    {
      headers: {
        Authorization: `Bearer ${authorization}`,
      },
    }
  );
  return response.data;
};

export const getMoviesOrTvShowsByQuery = async <T>(
  query: string,
  queryType: "movie" | "tv" = "movie",
  authorization: string
): Promise<T[]> => {
  const response = await axios.get<{ results: T[] }>(
    `${apiUrl}/search/${queryType}?query=${query}&include_adult=false&language=en-US&page=1`,
    {
      headers: {
        Authorization: `Bearer ${authorization}`,
      },
    }
  );
  return response.data.results;
};
