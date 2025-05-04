import { useMutation } from "@tanstack/react-query";
import { useAppDispatch } from "../store";
import { mp4ConversionActions } from "../store/mp4Conversion/mp4Conversion.slice";

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
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: (filePath: string) =>
      window.fileManagerAPI.deleteFile(filePath),
    onSuccess: (data, filePathDeleted, context) => {
      if (data.success) {
        window.mp4ConversionAPI.getConversionQueue().then((queue) => {
          const queueItem = queue.find(
            (item) => item.inputPath === filePathDeleted,
          );
          if (queueItem) {
            window.mp4ConversionAPI.removeFromConversionQueue(
              queueItem.inputPath,
            );
            dispatch(
              mp4ConversionActions.removeFromConversionQueue(
                queueItem.inputPath,
              ),
            );
          }
        });

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
