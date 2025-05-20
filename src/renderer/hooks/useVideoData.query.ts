import { useQuery } from "@tanstack/react-query";
import { VideoDataModel } from "../../models/videoData.model";

export function useVideoDataQuery({
  filePath,
  includeThumbnail = false,
  category,
}: {
  filePath: string;
  includeThumbnail?: boolean;
  category: string;
}) {
  return useQuery<VideoDataModel[]>({
    queryKey: ["videoData", filePath, includeThumbnail, category],
    queryFn: () =>
      window.videoAPI.fetchVideoData({
        filePath,
        includeThumbnail,
        category,
      }),
    enabled: !!filePath,
    networkMode: "always",
  });
}

export function useVideoDetailsQuery(params: {
  path: string;
  category: string;
}) {
  return useQuery<VideoDataModel | null>({
    queryKey: ["videoDetails", params.path, params.category],
    queryFn: () => window.videoAPI.fetchVideoDetails(params),
    enabled: !!params.path,
    networkMode: "always",
  });
}

export function useFolderDetailsQuery(path: string) {
  return useQuery<VideoDataModel | null>({
    queryKey: ["folderDetails", path],
    queryFn: () => window.videoAPI.fetchFolderDetails({ path }),
    enabled: !!path,
    networkMode: "always",
  });
}

export function useRecentlyWatchedVideosQuery(args: {
  videoType: "movies" | "tvShows";
  limit?: number;
}) {
  return useQuery<VideoDataModel[]>({
    queryKey: ["recentlyWatchedVideos", args.videoType, args.limit],
    queryFn: () => window.videoAPI.fetchRecentlyWatchedVideosData(args),
    enabled: !!args.videoType,
    networkMode: "always",
  });
}

export function useRecentlyWatchedCustomVideosQuery(limit?: number) {
  return useQuery({
    queryKey: ["recentlyWatchedCustomVideos", limit],
    queryFn: () => window.videoAPI.fetchRecentlyWatchedCustomVideosData({ limit }),
    networkMode: "always",
  });
}

export function useWatchlaterVideosQuery() {
  return useQuery<VideoDataModel[]>({
    queryKey: ["watchlaterVideos"],
    queryFn: () => window.videoAPI.fetchWatchlaterVideos(),
    networkMode: "always",
  });
}
