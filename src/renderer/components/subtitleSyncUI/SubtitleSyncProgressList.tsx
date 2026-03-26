import { Box, Chip } from "@mui/material";
import React from "react";
import { useConfirmation } from "../../contexts/ConfirmationContext";
import { SubtitleSyncQueueItem } from "../../../models/subtitle-sync-queue-item.model";
import { useAppDispatch } from "../../store";
import { subtitleSyncActions } from "../../store/subtitleSync.slice";
import {
  pauseSubtitleSyncItem,
  removeFromSubtitleSyncQueue,
  unpauseSubtitleSyncItem,
} from "../../util/subtitleSyncAPI-helpers";
import theme from "../../theme";
import { useDragState } from "../../hooks/useDragState";
import { AppDrop } from "../common/AppDrop";
import { useMutation } from "@tanstack/react-query";
import { DragSubtitleSyncProgressItem, SubtitleSyncProgressListItem } from "./SubtitleSyncProgressListItem";

interface SubtitleSyncProgressListProps {
  subtitleSyncProgress: SubtitleSyncQueueItem[];
}

export const SubtitleSyncProgressList = ({
  subtitleSyncProgress = [],
}: SubtitleSyncProgressListProps) => {
  const { openDialog } = useConfirmation();
  const dispatch = useAppDispatch();

  const { isAnyDragging, setDragging } = useDragState();

  const sortedSubtitleSyncProgress = React.useMemo(() => {
    return [...subtitleSyncProgress];
  }, [subtitleSyncProgress]);

  const handlePause = async (id: string) => {
    const result = await pauseSubtitleSyncItem(id);
    dispatch(subtitleSyncActions.setSyncProgress(result.queue));
  };

  const handleResume = async (id: string) => {
    const result = await unpauseSubtitleSyncItem(id);
    dispatch(subtitleSyncActions.setSyncProgress(result.queue));
  };

  const { mutateAsync: swapQueueItems } = useMutation({
    mutationFn: ({ id1, id2 }: { id1: string; id2: string }) =>
      window.subtitleSyncAPI.swapQueueItems(id1, id2),
    onSuccess: (data) => {
      if (!data.success) console.error("Error swapping subtitle sync queue items:");
      else dispatch(subtitleSyncActions.setSyncProgress(data.queue));
    },
    onError: (error) => {
      console.error("Error swapping subtitle sync queue items:", error);
    },
  });

  if (subtitleSyncProgress.length === 0) {
    return null;
  }

  const handleCancel = async (id: string) => {
    const dialogDecision = await openDialog(
      undefined,
      undefined,
      "Are you sure you want to cancel this subtitle sync?",
    );
    if (dialogDecision === "Ok") {
      const result = await removeFromSubtitleSyncQueue(id);
      console.log("Cancel result:", result);
      dispatch(subtitleSyncActions.setSyncProgress(result?.queue));
    }
  };

  const count = subtitleSyncProgress.length;

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
        {sortedSubtitleSyncProgress?.map((progress, index) => (
          <SubtitleSyncProgressListItem
            key={index}
            progress={progress}
            onPause={handlePause}
            onResume={handleResume}
            onCancel={handleCancel}
            idx={index}
            dragging={setDragging}
            onSwap={async (id1, id2) => {
              console.log("Swapping subtitle sync items:", id1, id2);
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
            itemDroped={(item: DragSubtitleSyncProgressItem) => {
              handleCancel(item.progressData.id);
            }}
            accept={["SUBTITLE_SYNC"]}
            backgroundColor={theme.palette.primary.main}
          />
        )}
      </Box>
    </Box>
  );
};