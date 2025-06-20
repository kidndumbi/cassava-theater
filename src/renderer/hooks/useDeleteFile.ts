import { useMutation } from "@tanstack/react-query";
import { removeFromConversionQueue } from "../util/mp4ConversionAPI-helpers";

export function useDeleteFile(
  onSuccess?: (
    data?: {
      success: boolean;
      message: string;
    },
    variables?: string,
    context?: unknown,
  ) => Promise<unknown> | unknown,
  onError?: (
    error?: Error,
    variables?: string,
    context?: unknown,
  ) => Promise<unknown> | unknown,
) {
  const removeFromConversion = async (filePathDeleted: string) => {
    const queue = await window.mp4ConversionAPI.getConversionQueue();
    const itemIds: string[] = queue
      .filter((item) => item.inputPath === filePathDeleted)
      .map((item) => item.id);
    if (itemIds.length > 0) {
      itemIds.forEach((id) => {
        removeFromConversionQueue(id);
      });
    }
  };

  const removeFromPlaylists = async (filePathDeleted: string) => {
    const playlists = await window.playlistAPI.getAllPlaylists();
    playlists.forEach((p) => {
      if (p.videos.includes(filePathDeleted)) {
        const removedDeleted = p.videos.filter((v) => v !== filePathDeleted);
        window.playlistAPI.putPlaylist(p.id, {
          ...p,
          videos: removedDeleted,
          lastVideoPlayed:
            p.lastVideoPlayed === filePathDeleted ? null : p.lastVideoPlayed,
        });
      }
    });
  };

  return useMutation({
    mutationFn: (filePath: string) =>
      window.fileManagerAPI.deleteFile(filePath),
    onSuccess: async (data, filePathDeleted, context) => {
      if (data.success) {
        await removeFromConversion(filePathDeleted);
        await removeFromPlaylists(filePathDeleted);
        onSuccess?.(data, filePathDeleted, context);
      } else {
        onError?.(new Error(data.message), filePathDeleted, context);
      }
    },
    onError: (error, variables, context) => {
      onError?.(error, variables, context);
    },
  });
}
