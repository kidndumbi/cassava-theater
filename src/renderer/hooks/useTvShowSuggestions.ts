import { useQuery } from "@tanstack/react-query";
import { fetchTvShowSuggestionsApi } from "../api/theMovieDb.api";

export function useTvShowSuggestions(query: string) {
  return useQuery({
    queryKey: ["tvShowSuggestions", query],
    queryFn: () => fetchTvShowSuggestionsApi(query),
    enabled: !!query,
  });
}