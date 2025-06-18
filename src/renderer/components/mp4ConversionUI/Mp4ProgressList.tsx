import { Box, Chip } from "@mui/material";
import React from "react";
import { useConfirmation } from "../../contexts/ConfirmationContext";
import { ConversionQueueItem } from "../../../models/conversion-queue-item.model";
import { useAppDispatch } from "../../store";
import { mp4ConversionNewActions } from "../../store/mp4ConversionNew.slice";
import {
  DragMp4ProgressItem,
  Mp4ProgressListItem,
} from "./Mp4ProgressListItem";
import {
  pauseConversionItem,
  removeFromConversionQueue,
  unpauseConversionItem,
} from "../../util/mp4ConversionAPI-helpers";
import theme from "../../theme";
import { useDragState } from "../../hooks/useDragState";
import { AppDrop } from "../common/AppDrop";
import { useMutation } from "@tanstack/react-query";

interface Mp4ProgressListProps {
  mp4ConversionProgress: ConversionQueueItem[];
}

export const Mp4ProgressList = ({
  mp4ConversionProgress = [],
}: Mp4ProgressListProps) => {
  const { openDialog } = useConfirmation();
  const dispatch = useAppDispatch();

  const { isAnyDragging, setDragging } = useDragState();

  const sortedMp4ConversionProgress = React.useMemo(() => {
    return [...mp4ConversionProgress];
  }, [mp4ConversionProgress]);

  const handlePause = async (id: string) => {
    const result = await pauseConversionItem(id);
    dispatch(mp4ConversionNewActions.setConversionProgress(result.queue));
  };

  const handleResume = async (id: string) => {
    const result = await unpauseConversionItem(id);
    dispatch(mp4ConversionNewActions.setConversionProgress(result.queue));
  };

  const { mutateAsync: swapQueueItems } = useMutation({
    mutationFn: ({ id1, id2 }: { id1: string; id2: string }) =>
      window.mp4ConversionAPI.swapQueueItems(id1, id2),
    onSuccess: (data) => {
      if (!data.success) console.error("Error swapping queue items:");
      else dispatch(mp4ConversionNewActions.setConversionProgress(data.queue));
    },
    onError: (error) => {
      console.error("Error swapping queue items:", error);
    },
  });

  if (mp4ConversionProgress.length === 0) {
    return null;
  }

  const handleCancel = async (id: string) => {
    const dialogDecision = await openDialog(
      undefined,
      undefined,
      "Are you want to cancel?",
    );
    if (dialogDecision === "Ok") {
      const result = await removeFromConversionQueue(id);
      console.log("Cancel result:", result);
      dispatch(mp4ConversionNewActions.setConversionProgress(result?.queue));
    }
  };

  const count = mp4ConversionProgress.length;

  return (
    <Box className="ml-14 mr-14 mt-4">
      <Chip
        label={count}
        variant="outlined"
        sx={{
          color: theme.customVariables.appWhiteSmoke,
          backgroundColor: theme.customVariables.appDark,
          border: "none",
        }}
      />
      <Box className="mt-2 flex flex-col gap-2">
        {sortedMp4ConversionProgress?.map((progress, index) => (
          <Mp4ProgressListItem
            key={index}
            progress={progress}
            onPause={handlePause}
            onResume={handleResume}
            onCancel={handleCancel}
            idx={index}
            dragging={setDragging}
            onSwap={async (id1, id2) => {
              console.log("Swapping items:", id1, id2);
              swapQueueItems({ id1, id2 });
            }}
          />
        ))}
        {isAnyDragging && (
          <AppDrop
            conatinerStyle={{
              top: "6px",
            }}
            buttonText="Cancel"
            itemDroped={(item: DragMp4ProgressItem) => {
              handleCancel(item.progressData.id);
            }}
            accept={["MP4_CONVERSION"]}
            backgroundColor={theme.palette.primary.main}
          />
        )}
      </Box>
    </Box>
  );
};
