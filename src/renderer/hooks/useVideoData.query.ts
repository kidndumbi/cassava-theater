import { useQuery } from "@tanstack/react-query";
import {
  fetchVideoData,
  fetchVideoDetails,
  fetchFolderDetails,
} from "../api/videoData.api";
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
    queryFn: () => fetchVideoData({
      filePath,
      includeThumbnail,
      category,
    }),
    enabled: !!filePath,
  });
}

export function useVideoDetailsQuery(params: {
  path: string;
  category: string;
}) {
  return useQuery<VideoDataModel | null>({
    queryKey: ["videoDetails", params.path, params.category],
    queryFn: () => fetchVideoDetails(params),
    enabled: !!params.path,
  });
}

export function useFolderDetailsQuery(path: string) {
  return useQuery<VideoDataModel | null>({
    queryKey: ["folderDetails", path],
    queryFn: () => fetchFolderDetails(path),
    enabled: !!path,
  });
}
