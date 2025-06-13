import { Box } from "@mui/material";
import React from "react";
import { useConfirmation } from "../../contexts/ConfirmationContext";
import { ConversionQueueItem } from "../../../models/conversion-queue-item.model";
import { useAppDispatch } from "../../store";
import { mp4ConversionNewActions } from "../../store/mp4ConversionNew.slice";
import { Mp4ProgressListItem } from "./Mp4ProgressListItem";

const filterFailed = (queue: ConversionQueueItem[]) =>
  queue.filter((q) => q.status !== "failed");

interface Mp4ProgressListProps {
  mp4ConversionProgress: ConversionQueueItem[];
}

export const Mp4ProgressList = ({
  mp4ConversionProgress = [],
}: Mp4ProgressListProps) => {
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

  const handlePause = async (inputPath: string) => {
    const result = await window.mp4ConversionAPI.pauseConversionItem(inputPath);
    dispatch(
      mp4ConversionNewActions.setConversionProgress(filterFailed(result.queue)),
    );
  };

  const handleResume = async (inputPath: string) => {
    const result =
      await window.mp4ConversionAPI.unpauseConversionItem(inputPath);
    dispatch(
      mp4ConversionNewActions.setConversionProgress(filterFailed(result.queue)),
    );
  };

  const handleCancel = async (inputPath: string) => {
    const dialogDecision = await openDialog(
      undefined,
      undefined,
      "Are you want to cancel?",
    );
    if (dialogDecision === "Ok") {
      const result =
        await window.mp4ConversionAPI.removeFromConversionQueue(inputPath);
      dispatch(
        mp4ConversionNewActions.setConversionProgress(
          filterFailed(result.queue),
        ),
      );
    }
  };

  return (
    <Box className="ml-14 mr-14 mt-4">
      <Box className="mt-2 flex flex-col gap-2">
        {sortedMp4ConversionProgress.map((progress, index) => (
          <Mp4ProgressListItem
            key={index}
            progress={progress}
            onPause={handlePause}
            onResume={handleResume}
            onCancel={handleCancel}
          />
        ))}
      </Box>
    </Box>
  );
};
