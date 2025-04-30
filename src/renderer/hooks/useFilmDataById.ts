import { useQuery } from "@tanstack/react-query";

export function useFilmDataById(id: string, queryType: "movie" | "tv") {
  return useQuery({
    queryKey: ["filmDataById", id, queryType],
    queryFn: () => window.theMovieDbAPI.movieOrTvShow(id, queryType),
    enabled: !!id && !!queryType,
  });
}
