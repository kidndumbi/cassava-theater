import { Box, CircularProgress } from "@mui/material";
import theme from "../../theme";
import { YoutubeDownloadQueueItem } from "../../../main/services/youtube.service";
import { AppButton } from "../common/AppButton";
import { YoutubeDownloadProgressDetails } from "./YoutubeDownloadProgressDetails";
import { DragPreviewImage, useDrag, useDrop } from "react-dnd";
import { useEffect, useRef } from "react";
import { useDragPreviewImage } from "../../hooks/useDragPreviewImage";

export interface DragProgressItem {
  index: number;
  type: string;
  progressData: YoutubeDownloadQueueItem;
}

export function YoutubeDownloadProgressListItem({
  progressItem,
  isRemoving,
  onCancel,
  idx,
  dragging,
  onSwap,
}: {
  progressItem: YoutubeDownloadQueueItem;
  isRemoving: boolean;
  onCancel: (item: YoutubeDownloadQueueItem) => void | Promise<void>;
  idx: number;
  dragging: (isDragging: boolean, idx: number) => void;
  onSwap: (id1: string, id2: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isOver, canDrop }, drop] = useDrop<
    DragProgressItem,
    void,
    { isOver: boolean; canDrop: boolean }
  >({
    accept: "YOUTUBE_DOWNLOAD",
    canDrop: () =>
      progressItem.status !== "downloading",
    drop(item) {
      if (item.index === idx) return;
      console.log("Dropped item:", item);
      onSwap(item.progressData.id, progressItem.id);

      //moveVideo(item.index, idx);
      item.index = idx;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  });

  const [{ isDragging }, drag, dragPreview] = useDrag({
    type: "YOUTUBE_DOWNLOAD",
    item: {
      index: idx,
      type: "YOUTUBE_DOWNLOAD",
      progressData: progressItem,
    },
    canDrag: () => progressItem.status !== "downloading",
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const previewSrc = useDragPreviewImage(progressItem.title);

  useEffect(() => {
    dragging(isDragging, idx);
  }, [isDragging, dragging, idx]);

  drag(drop(ref));

  return (
    <>
      <DragPreviewImage connect={dragPreview} src={previewSrc} />
      <div
        ref={ref}
        style={{
          border:
            isOver && canDrop
              ? `2px solid ${theme.palette.primary.main}`
              : "none",
        }}
      >
        <Box
          className="mb-2 flex place-content-between items-center gap-2 rounded-md p-1 pr-2"
          sx={{
            backgroundColor: theme.customVariables.appDark,
          }}
        >
          <YoutubeDownloadProgressDetails item={progressItem} />
          <Box className="flex items-center justify-center gap-2">
            <Box>
              {progressItem.status === "downloading" && (
                <CircularProgress size={24} color="primary" />
              )}
            </Box>
            <AppButton
              color="error"
              disabled={isRemoving}
              onClick={() => onCancel(progressItem)}
            >
              Cancel
            </AppButton>
          </Box>
        </Box>
      </div>
    </>
  );
}
