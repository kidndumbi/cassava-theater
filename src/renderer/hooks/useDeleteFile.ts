import { useMutation } from "@tanstack/react-query";
import { mp4ConversionNewActions } from "../store/mp4ConversionNew.slice";

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
  const removeFromConversionQueue = async (filePathDeleted: string) => {
    const queue = await window.mp4ConversionAPI.getConversionQueue();
    const queueItem = queue.find((item) => item.inputPath === filePathDeleted);
    if (queueItem) {
      mp4ConversionNewActions.setConversionProgress(
        (
          await window.mp4ConversionAPI.removeFromConversionQueue(
            queueItem.inputPath,
          )
        ).queue.filter((q) => q.status !== "failed"),
      );
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
        await removeFromConversionQueue(filePathDeleted);
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
