import { Box, Chip } from "@mui/material";
import React from "react";
import { useConfirmation } from "../../contexts/ConfirmationContext";
import { SubtitleGenerationQueueItem } from "../../../models/subtitle-generation-queue-item.model";
import { useAppDispatch } from "../../store";
import { subtitleGenerationActions } from "../../store/subtitleGeneration.slice";
import theme from "../../theme";
import { useDragState } from "../../hooks/useDragState";
import { AppDrop } from "../common/AppDrop";
import { useMutation } from "@tanstack/react-query";
import { DragSubtitleProgressItem, SubtitleProgressListItem } from "./SubtitleProgressListItem";

interface SubtitleProgressListProps {
  subtitleGenerationProgress: SubtitleGenerationQueueItem[];
}

export const SubtitleProgressList = ({
  subtitleGenerationProgress = [],
}: SubtitleProgressListProps) => {
  const { openDialog } = useConfirmation();
  const dispatch = useAppDispatch();

  const { isAnyDragging, setDragging } = useDragState();

  const sortedSubtitleGenerationProgress = React.useMemo(() => {
    return [...subtitleGenerationProgress];
  }, [subtitleGenerationProgress]);

  const handlePause = async (id: string) => {
    const result = await window.subtitleAPI.pauseSubtitleGenerationItem(id);
    dispatch(subtitleGenerationActions.setSubtitleGenerationProgress(result.queue));
  };

  const handleResume = async (id: string) => {
    const result = await window.subtitleAPI.unpauseSubtitleGenerationItem(id);
    dispatch(subtitleGenerationActions.setSubtitleGenerationProgress(result.queue));
  };

  const { mutateAsync: swapQueueItems } = useMutation({
    mutationFn: ({ id1, id2 }: { id1: string; id2: string }) =>
      window.subtitleAPI.swapSubtitleQueueItems(id1, id2),
    onSuccess: (data) => {
      if (!data.success) console.error("Error swapping queue items:");
      else dispatch(subtitleGenerationActions.setSubtitleGenerationProgress(data.queue));
    },
    onError: (error) => {
      console.error("Error swapping queue items:", error);
    },
  });

  if (subtitleGenerationProgress.length === 0) {
    return null;
  }

  const handleCancel = async (id: string) => {
    const dialogDecision = await openDialog(
      undefined,
      undefined,
      "Are you want to cancel subtitle generation?",
    );
    if (dialogDecision === "Ok") {
      const result = await window.subtitleAPI.removeFromSubtitleGenerationQueue(id);
      console.log("Cancel result:", result);
      dispatch(subtitleGenerationActions.setSubtitleGenerationProgress(result?.queue));
    }
  };

  const count = subtitleGenerationProgress.length;

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
        {sortedSubtitleGenerationProgress?.map((progress, index) => (
          <SubtitleProgressListItem
            key={index}
            progress={progress}
            onPause={handlePause}
            onResume={handleResume}
            onCancel={handleCancel}
            idx={index}
            dragging={setDragging}
            onSwap={async (id1, id2) => {
              console.log("Swapping subtitle items:", id1, id2);
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
            itemDroped={(item: DragSubtitleProgressItem) => {
              if (item.progressData.id) {
                handleCancel(item.progressData.id);
              }
            }}
            accept={["SUBTITLE_GENERATION"]}
            backgroundColor={theme.palette.primary.main}
          />
        )}
      </Box>
    </Box>
  );
};