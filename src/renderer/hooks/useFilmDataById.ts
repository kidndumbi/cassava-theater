import { useQuery } from "@tanstack/react-query";
import { fetchFilmDataByIdApi } from "../api/theMovieDb.api";

export function useFilmDataById(id: string, queryType: "movie" | "tv") {
  return useQuery({
    queryKey: ["filmDataById", id, queryType],
    queryFn: () => fetchFilmDataByIdApi(id, queryType),
    enabled: !!id && !!queryType,
  });
}
