import { Box, Button, Checkbox, Typography } from "@mui/material";
import theme from "../../theme";
import { ConversionQueueItem } from "../../../models/conversion-queue-item.model";
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

export interface DragMp4ProgressItem {
  index: number;
  type: string;
  progressData: ConversionQueueItem;
}

export const Mp4ProgressListItem = ({
  progress,
  onPause,
  onResume,
  onCancel,
  idx,
  dragging,
  onSwap,
}: {
  progress: ConversionQueueItem;
  onPause: (inputPath: string) => void;
  onResume: (inputPath: string) => void;
  onCancel: (id: string) => void;
  idx: number;
  dragging: (isDragging: boolean, idx: number) => void;
  onSwap: (id1: string, id2: string) => void;
}) => {
  const isProcessing = progress.status === "processing";
  const ref = useRef<HTMLDivElement>(null);

  const [{ isOver, canDrop }, drop] = useDrop<
    DragMp4ProgressItem,
    void,
    { isOver: boolean; canDrop: boolean }
  >({
    accept: "MP4_CONVERSION",
    canDrop: () => !isProcessing,
    drop(item) {
      if (item.index === idx) return;
      onSwap(item.progressData.id, progress.id);
      item.index = idx;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  });

  const [{ isDragging }, drag, dragPreview] = useDrag({
    type: "MP4_CONVERSION",
    item: {
      index: idx,
      type: "MP4_CONVERSION",
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

  const previewSrc = useDragPreviewImage(progress.outputPath || "");

  drag(drop(ref));

  return (
    <>
      <DragPreviewImage connect={dragPreview} src={previewSrc} />
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
            <FilePathText path={progress.outputPath} />
          </Box>
          <Box className="flex gap-2" sx={{ alignItems: "center" }}>
            {!isProcessing &&
              (progress.paused ? (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => onResume(progress.id)}
                  sx={{ alignSelf: "center" }}
                >
                  Resume
                </Button>
              ) : (
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => onPause(progress.id)}
                  sx={{ alignSelf: "center" }}
                >
                  Pause
                </Button>
              ))}
            {isProcessing && (
              <CircularProgressWithLabel value={progress.percent} />
            )}
            <Button
              size="small"
              variant="contained"
              color="error"
              onClick={() => onCancel(progress.id)}
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
