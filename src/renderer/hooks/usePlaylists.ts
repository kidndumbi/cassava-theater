import { useQuery } from "@tanstack/react-query";

export function usePlaylists() {
  return useQuery({
    queryKey: ["playlists"],
    queryFn: () => window.playlistAPI.getAllPlaylists(),
  });
}
