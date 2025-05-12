import { useQueries } from "@tanstack/react-query";
import { PlaylistModel } from "../../models/playlist.model";

export const useGetPlaylistVideoData = (playlist: PlaylistModel) => {
  return useQueries({
    queries: Array.isArray(playlist?.videos)
      ? playlist?.videos.map((filepath) => ({
          queryKey: ["videoDetails", filepath, "movies"],
          queryFn: () =>
            window.videoAPI.fetchVideoDetails({
              path: filepath,
              category: "movies",
            }),
          enabled: !!(playlist?.videos.length > 0),
        }))
      : [],
    combine: (results) => {
      return {
        data: results.map((result) => result.data),
        pending: results.some((result) => result.isPending),
      };
    },
  });
};
