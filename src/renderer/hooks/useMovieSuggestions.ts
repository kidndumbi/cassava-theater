import { useQuery } from "@tanstack/react-query";
import { fetchMovieSuggestionsApi } from "../api/theMovieDb.api";


export function useMovieSuggestions(query: string) {
  return useQuery({
    queryKey: ["movieSuggestions", query],
    queryFn: () => fetchMovieSuggestionsApi(query),
    enabled: !!query,
  });
}