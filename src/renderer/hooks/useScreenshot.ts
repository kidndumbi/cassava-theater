import { useQuery } from "@tanstack/react-query";
import { VideoDataModel } from "../../models/videoData.model";
import { getScreenshotApi } from "../api/videoData.api";

export function useScreenshot(videodata: VideoDataModel) {
  return useQuery<string | null>({
    queryKey: [
      "screenshot",
      {
        filePath: videodata?.filePath,
        currentTime: videodata?.currentTime,
        duration: videodata?.duration,
      },
    ],
    queryFn: async () => {
      const response = await getScreenshotApi(videodata);
      return response;
    },
    enabled: !!videodata?.filePath,
  });
}
