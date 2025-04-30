import { useQuery } from "@tanstack/react-query";

export function useMovieSuggestions(query: string) {
  return useQuery({
    queryKey: ["movieSuggestions", query],
    queryFn: () => window.theMovieDbAPI.search(query, "movie"),
    enabled: !!query,
  });
}