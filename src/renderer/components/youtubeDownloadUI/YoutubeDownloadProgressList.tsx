import { Box, CircularProgress } from "@mui/material";
import theme from "../../theme";
import { YoutubeDownloadQueueItem } from "../../../main/services/youtube.service";
import { useEffect } from "react";
import { AppButton } from "../common/AppButton";
import { YoutubeDownloadProgressDetails } from "./YoutubeDownloadProgressDetails";
import { useMutation } from "@tanstack/react-query";
import { useAppDispatch } from "../../store";
import { youtubeDownloadActions } from "../../store/youtubeDownload.slice";

export const YoutubeDownloadProgressList = ({
  progressList,
}: {
  progressList: YoutubeDownloadQueueItem[];
}) => {
  const dispatch = useAppDispatch();


  const { mutateAsync: removeFromQueue, isPending: isRemoving } = useMutation({
    mutationFn: (id: string) => window.youtubeAPI.removeFromQueue(id),
    onError: (error) => {
      console.error("Error removing from queue:", error);
    },
  });

  return (
    <>
      {progressList.length > 0 &&
        progressList.map((item) => (
          <Box
            className="mb-2 flex place-content-between items-center gap-2 rounded-md p-1 pr-2"
            sx={{
              backgroundColor: theme.customVariables.appDark,
            }}
          >
            <YoutubeDownloadProgressDetails item={item} />
            <Box className="flex items-center justify-center gap-2">
              <Box>
                {item.status === "downloading" && (
                  <CircularProgress size={24} color="primary" />
                )}
              </Box>
              <AppButton
                color="error"
                disabled={isRemoving}
                onClick={async () => {
                  console.log("Cancel Download", item);
                  await removeFromQueue(item.id);
                  const queue = await window.youtubeAPI.getQueue();
                  dispatch(youtubeDownloadActions.setDownloadProgress(queue));
                }}
              >
                Cancel
              </AppButton>
            </Box>
          </Box>
        ))}
    </>
  );
};
