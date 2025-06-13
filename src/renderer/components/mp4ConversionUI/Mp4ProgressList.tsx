import { Box, Button, Checkbox, Typography } from "@mui/material";
import React, { useEffect } from "react";
import { useConfirmation } from "../../contexts/ConfirmationContext";
import { ConversionQueueItem } from "../../../models/conversion-queue-item.model";
import theme from "../../theme";
import { CircularProgressWithLabel } from "../common/CircularProgressWithLabel";
import { useAppDispatch } from "../../store";
import { mp4ConversionNewActions } from "../../store/mp4ConversionNew.slice";

interface Mp4ProgressListProps {
  mp4ConversionProgress: ConversionQueueItem[];
}

export const Mp4ProgressList = ({
  mp4ConversionProgress = [],
}: Mp4ProgressListProps) => {
  useEffect(() => {
    console.log(" mp4ConversionProgress: ", mp4ConversionProgress);
  }, [mp4ConversionProgress]);

  const { openDialog } = useConfirmation();
  const dispatch = useAppDispatch();

  const sortedMp4ConversionProgress = React.useMemo(() => {
    return [...mp4ConversionProgress].sort((a, b) => {
      if (a.status === "processing" && b.status !== "processing") return -1;
      if (a.status !== "processing" && b.status === "processing") return 1;
      return 0;
    });
  }, [mp4ConversionProgress]);

  if (mp4ConversionProgress.length === 0) {
    return null;
  }

  const FilePathText = ({ path }: { path: string }) => (
    <Typography
      variant="body2"
      sx={{
        color: theme.customVariables.appWhiteSmoke,
        marginRight: "10px",
      }}
      component="div"
    >
      {path}
    </Typography>
  );

  return (
    <Box className="ml-14 mr-14 mt-4">
      <Box className="mt-2 flex flex-col gap-2">
        {sortedMp4ConversionProgress.map((progress, index) => (
          <Box
            key={index}
            className="flex place-content-between items-center rounded-md p-1"
            sx={{
              backgroundColor: theme.customVariables.appDark,
            }}
          >
            <Box className="flex items-center gap-2">
              <Box
                sx={{ width: 40, display: "flex", justifyContent: "center" }}
              >
                {progress.status !== "processing" && (
                  <Checkbox
                    checked={false}
                    onChange={(e) => console.log(e.target.checked)}
                    sx={{
                      marginRight: 1,
                      color: theme.palette.primary.main,
                    }}
                  />
                )}
              </Box>

              <FilePathText path={progress.outputPath} />
            </Box>

            <Box className="flex gap-2" sx={{ alignItems: "center" }}>
              {progress.status !== "processing" && (
                <>
                  {!progress.paused ? (
                    <Button
                      size="small"
                      variant="contained"
                      onClick={async () => {
                        const result =
                          await window.mp4ConversionAPI.pauseConversionItem(
                            progress.inputPath,
                          );
                        if (!result) {
                          console.error(
                            `Failed to pause ${progress.inputPath} from conversion queue.`,
                          );
                          return;
                        }
                        const queue = (
                          await window.mp4ConversionAPI.getConversionQueue()
                        ).filter((q) => q.status !== "failed");
                        console.log("queue after pause: ", queue);
                        dispatch(
                          mp4ConversionNewActions.setConversionProgress(queue),
                        );
                      }}
                      sx={{ alignSelf: "center" }}
                    >
                      Pause
                    </Button>
                  ) : (
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={async () => {
                        const result =
                          await window.mp4ConversionAPI.unpauseConversionItem(
                            progress.inputPath,
                          );
                        if (!result) {
                          console.error(
                            `Failed to unpause ${progress.inputPath} from conversion queue.`,
                          );
                          return;
                        }
                        const queue = (
                          await window.mp4ConversionAPI.getConversionQueue()
                        ).filter((q) => q.status !== "failed");
                        console.log("queue after unpause: ", queue);
                        dispatch(
                          mp4ConversionNewActions.setConversionProgress(queue),
                        );
                      }}
                      sx={{ alignSelf: "center" }}
                    >
                      Resume
                    </Button>
                  )}
                </>
              )}

              <Button
                size="small"
                variant="contained"
                color="error"
                onClick={() => {
                  openDialog(
                    undefined,
                    undefined,
                    "Are you want to cancel?",
                  ).then(async (dialogDecision) => {
                    if (dialogDecision === "Ok") {
                      const result =
                        await window.mp4ConversionAPI.removeFromConversionQueue(
                          progress.inputPath,
                        );
                      if (!result) {
                        console.error(
                          `Failed to remove ${progress.inputPath} from conversion queue.`,
                        );
                        return;
                      }
                      const queue = (
                        await window.mp4ConversionAPI.getConversionQueue()
                      ).filter((q) => q.status !== "failed");
                      dispatch(
                        mp4ConversionNewActions.setConversionProgress(queue),
                      );
                    }
                  });
                }}
                sx={{ alignSelf: "center" }}
              >
                Cancel
              </Button>

              {progress.status === "processing" && (
                <CircularProgressWithLabel value={progress.percent} />
              )}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};
