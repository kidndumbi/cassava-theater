import * as React from "react";
import theme from "../../theme";
import { DragPreviewImage, useDrag, useDrop } from "react-dnd";
import { VideoDataModel } from "../../../models/videoData.model";
import { AppContextMenu } from "../common/AppContextMenu";
import { PosterCard } from "../common/PosterCard";
import { removeVidExt, trimFileName } from "../../util/helperFunctions";
import { useDragPreviewImage } from "../../hooks/useDragPreviewImage";
import { DragVideoItem } from "../../../models/drag-video-item.model";
import {
  PlaylistDisplayType,
  PlaylistModel,
} from "../../../models/playlist.model";
import { Avatar, Box } from "@mui/material";
import { VideoProgressBar } from "../common/VideoProgressBar";

export const PlaylistsVideo: React.FC<{
  video: VideoDataModel;
  idx: number;
  getImageUrl: (video: VideoDataModel) => string | undefined;
  onPlayVideo: (videoIndex: number) => void;
  handleRemove: (videoIdx: number) => void;
  handleInfo: (videoIdx: number) => void;
  moveVideo: (from: number, to: number) => void;
  currentPlaylist: PlaylistModel;
  dragging: (isDragging: boolean, idx: number) => void;
  displayType: PlaylistDisplayType;
}> = ({
  video,
  idx,
  getImageUrl,
  onPlayVideo,
  handleRemove,
  handleInfo,
  moveVideo,
  currentPlaylist,
  dragging,
  displayType,
}) => {
  const ref = React.useRef<HTMLDivElement>(null);

  const [{ isOver }, drop] = useDrop<DragVideoItem, void, { isOver: boolean }>({
    accept: "VIDEO",
    drop(item) {
      if (item.index === idx) return;
      moveVideo(item.index, idx);
      item.index = idx;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  });

  const [{ opacity, isDragging }, drag, dragPreview] = useDrag({
    type: "VIDEO",
    item: {
      index: idx,
      type: "VIDEO",
      videoData: video,
      currentPlaylist: currentPlaylist,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
      opacity: monitor.isDragging() ? 0.5 : 1,
    }),
  });

  const previewSrc = useDragPreviewImage(video.fileName);

  React.useEffect(() => {
    dragging(isDragging, idx);
  }, [isDragging, dragging, idx]);

  drag(drop(ref));

  return (
    <>
      <DragPreviewImage connect={dragPreview} src={previewSrc} />
      <div
        ref={ref}
        style={{
          opacity,
          cursor: "move",
          border: isOver
            ? `2px solid ${theme.palette.primary.main}`
            : "2px solid transparent",
          borderRadius: 8,
          transition: "border-color 0.2s",
        }}
      >
        <AppContextMenu
          title={removeVidExt(video.fileName)}
          menuItems={[
            {
              label: "Remove",
              action: () => handleRemove(idx),
            },
            {
              label: "Info",
              action: () => handleInfo(idx),
            },
          ]}
        >
          <div>
            {displayType === "grid" ? (
              <PosterCard
                imageUrl={getImageUrl(video)}
                altText={video.fileName || ""}
                currentTime={video.currentTime}
                duration={video.duration}
                footer={trimFileName(video.fileName || "")}
                onClick={() => onPlayVideo(idx)}
              />
            ) : (
              <Box
                className="flex cursor-pointer gap-1"
                onClick={() => onPlayVideo(idx)}
              >
                <Avatar
                  variant="rounded"
                  src={getImageUrl(video)}
                  alt={video.fileName || ""}
                  sx={{ width: 80, height: 80 }}
                />
                <Box
                  className="flex min-w-0 flex-1 flex-col gap-1 rounded p-1"
                  sx={{
                    backgroundColor: theme.customVariables.appDark,
                    color: theme.customVariables.appWhiteSmoke,
                  }}
                >
                  <Box
                    className="overflow-hidden text-ellipsis whitespace-nowrap text-base font-semibold"
                    sx={{
                      color: theme.customVariables.appWhiteSmoke,
                    }}
                    title={video.fileName}
                  >
                    {removeVidExt(video.fileName)}
                  </Box>
                  <Box
                    className="overflow-hidden text-ellipsis whitespace-nowrap text-sm"
                    sx={{
                      color: theme.palette.primary.light,
                    }}
                    title={video.fileName}
                  >
                    {video.filePath}
                  </Box>
                  {typeof video.currentTime === "number" &&
                    typeof video.duration === "number" &&
                    video.currentTime > 0 && (
                      <VideoProgressBar
                        current={video.currentTime}
                        total={video.duration}
                      />
                    )}
                </Box>
              </Box>
            )}
          </div>
        </AppContextMenu>
      </div>
    </>
  );
};
