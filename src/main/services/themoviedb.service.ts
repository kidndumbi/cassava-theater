import axios from "axios";

const apiUrl = "https://api.themoviedb.org/3";
const Authorization =
  "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1NjNiNzgwMDM0OWI1YjlkZjRiZTMwZmNhMjBlOTliYyIsInN1YiI6IjY2NWI1MzNiZjBkNTQwYzEyYWU3NmFkYiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.IO8TFHXOKDq2QZeNVcgjRe5Hs5DzolD8sSO_Savmmec"; // Replace with your actual API key

export const getMovieOrTvShowById = async <T>(
  id: string,
  queryType: "movie" | "tv" = "movie"
): Promise<T> => {
  const response = await axios.get<T>(
    `${apiUrl}/${queryType}/${id}?language=en-US`,
    {
      headers: {
        Authorization,
      },
    }
  );
  return response.data;
};

export const getMoviesOrTvShowsByQuery = async <T>(
  query: string,
  queryType: "movie" | "tv" = "movie"
): Promise<T[]> => {
  const response = await axios.get<{ results: T[] }>(
    `${apiUrl}/search/${queryType}?query=${query}&include_adult=false&language=en-US&page=1`,
    {
      headers: {
        Authorization,
      },
    }
  );
  return response.data.results;
};
