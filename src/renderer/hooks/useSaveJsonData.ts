import { useMutation } from "@tanstack/react-query";
import { VideoDataModel } from "../../models/videoData.model";

export function useSaveJsonData(
  onSuccess?: (
    data?: {
      currentVideo: VideoDataModel;
      newVideoJsonData: VideoDataModel;
    },
    variables?: {
      currentVideo: VideoDataModel;
      newVideoJsonData: VideoDataModel;
    },
    context?: unknown,
  ) => void,
  onError?: (
    error?: Error,
    variables?: {
      currentVideo: VideoDataModel;
      newVideoJsonData: VideoDataModel;
    },
    context?: unknown,
  ) => void,
) {
  return useMutation({
    mutationFn: ({
      currentVideo,
      newVideoJsonData,
    }: {
      currentVideo: VideoDataModel;
      newVideoJsonData: VideoDataModel;
    }) => {
      return window.videoAPI.saveVideoJsonData({
        currentVideo,
        newVideoJsonData,
      });
    },
    onSuccess: (data, savedData, context) => {
      onSuccess?.(data, savedData, context);
    },
    onError: (error, variables, context) => {
      onError?.(error, variables, context);
      console.error("Error saving JSON data:", error);
    },
  });
}
