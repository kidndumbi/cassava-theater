import { Box, Button, Checkbox, Typography, Chip } from "@mui/material";
import theme from "../../theme";
import { SubtitleSyncQueueItem } from "../../../models/subtitle-sync-queue-item.model";
import { CircularProgressWithLabel } from "../common/CircularProgressWithLabel";
import { DragPreviewImage, useDrag, useDrop } from "react-dnd";
import { useEffect, useRef } from "react";
import { useDragPreviewImage } from "../../hooks/useDragPreviewImage";

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

const StatusChip = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return theme.palette.warning.main;
      case "processing":
        return theme.palette.info.main;
      case "completed":
        return theme.palette.success.main;
      case "failed":
        return theme.palette.error.main;
      case "paused":
        return theme.palette.secondary.main;
      default:
        return theme.customVariables.appWhiteSmoke;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "processing":
        return "Processing...";
      case "completed":
        return "Completed";
      case "failed":
        return "Failed";
      case "paused":
        return "Paused";
      default:
        return status;
    }
  };

  return (
    <Chip
      label={getStatusLabel(status)}
      size="small"
      sx={{
        backgroundColor: getStatusColor(status),
        color: theme.customVariables.appWhiteSmoke,
        fontWeight: "bold",
        minWidth: "90px",
      }}
    />
  );
};

const ProgressCheckbox = () => (
  <Checkbox
    checked={false}
    onChange={(e) => console.log(e.target.checked)}
    sx={{
      marginRight: 1,
      color: theme.palette.primary.main,
    }}
  />
);

export interface DragSubtitleSyncProgressItem {
  index: number;
  type: string;
  progressData: SubtitleSyncQueueItem;
}

export const SubtitleSyncProgressListItem = ({
  progress,
  onPause,
  onResume,
  onCancel,
  idx,
  dragging,
  onSwap,
}: {
  progress: SubtitleSyncQueueItem;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onCancel: (id: string) => void;
  idx: number;
  dragging: (isDragging: boolean, idx: number) => void;
  onSwap: (id1: string, id2: string) => void;
}) => {
  const isProcessing = progress.status === "processing";
  const ref = useRef<HTMLDivElement>(null);

  const [{ isOver, canDrop }, drop] = useDrop<
    DragSubtitleSyncProgressItem,
    void,
    { isOver: boolean; canDrop: boolean }
  >({
    accept: "SUBTITLE_SYNC",
    canDrop: () => !isProcessing,
    drop(item) {
      if (item.index === idx) return;
      if (item.progressData.id && progress.id) {
        onSwap(item.progressData.id, progress.id);
      }
      item.index = idx;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  });

  const [{ isDragging }, drag, dragPreview] = useDrag({
    type: "SUBTITLE_SYNC",
    item: {
      index: idx,
      type: "SUBTITLE_SYNC",
      progressData: progress,
    },
    canDrag: () => !isProcessing,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  useEffect(() => {
    dragging(isDragging, idx);
  }, [isDragging, dragging, idx]);

  const previewSrc = useDragPreviewImage(progress.videoPath || "");

  drag(drop(ref));

  const getDisplayText = () => {
    if (progress.fileName && progress.subtitlePath) {
      const subtitleFileName = progress.subtitlePath.split(/[/\\]/).pop() || "";
      return `${progress.fileName} → ${subtitleFileName}`;
    }
    return progress.fileName || progress.videoPath || "";
  };

  return (
    <>
      {previewSrc && (
        <DragPreviewImage connect={dragPreview} src={previewSrc} />
      )}
      <div ref={ref}>
        <Box
          className="flex place-content-between items-center rounded-md p-1"
          sx={{
            backgroundColor: theme.customVariables.appDark,
            border:
              (isOver && canDrop) || idx === 0
                ? `2px solid ${theme.palette.primary.main}`
                : "none",
            opacity: isDragging ? 0.5 : 1,
          }}
        >
          <Box className="flex items-center gap-2">
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              {!isProcessing && <ProgressCheckbox />}
            </Box>
            <FilePathText path={getDisplayText()} />
          </Box>
          <Box className="flex gap-2" sx={{ alignItems: "center" }}>
            {isProcessing && progress.status && (
              <StatusChip status={progress.status} />
            )}
            {!isProcessing && (
              <>
                {progress.status && <StatusChip status={progress.status} />}
                {progress.paused ? (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => progress.id && onResume(progress.id)}
                    sx={{ alignSelf: "center" }}
                  >
                    Resume
                  </Button>
                ) : (
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => progress.id && onPause(progress.id)}
                    sx={{ alignSelf: "center" }}
                  >
                    Pause
                  </Button>
                )}
              </>
            )}

            <Button
              size="small"
              variant="contained"
              color="error"
              onClick={() => progress.id && onCancel(progress.id)}
              sx={{ alignSelf: "center" }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </div>
    </>
  );
};
