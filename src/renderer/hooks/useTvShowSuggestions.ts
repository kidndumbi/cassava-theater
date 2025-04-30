import { useQuery } from "@tanstack/react-query";

export function useTvShowSuggestions(query: string) {
  return useQuery({
    queryKey: ["tvShowSuggestions", query],
    queryFn: () => window.theMovieDbAPI.search(query, "tv"),
    enabled: !!query,
  });
}