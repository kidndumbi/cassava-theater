import * as React from "react";
import theme from "../../theme";
import { DragPreviewImage, useDrag, useDrop } from "react-dnd";
import { VideoDataModel } from "../../../models/videoData.model";
import { AppContextMenu } from "../common/AppContextMenu";
import { PosterCard } from "../common/PosterCard";
import { removeVidExt, trimFileName } from "../../util/helperFunctions";
import { useDragPreviewImage } from "../../hooks/useDragPreviewImage";
import { DragVideoItem } from "../../../models/drag-video-item.model";
import { ListDisplayType, PlaylistModel } from "../../../models/playlist.model";
import { VideoListItem } from "../common/VideoListItem";

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
  displayType: ListDisplayType;
  handlResetVideo: (video: VideoDataModel) => void;
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
  handlResetVideo,
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
            {
              label: "Reset time",
              action: () => {
                handlResetVideo(video);
              },
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
              <VideoListItem
                video={video}
                getImageUrl={getImageUrl}
                onClick={() => onPlayVideo(idx)}
              />
            )}
          </div>
        </AppContextMenu>
      </div>
    </>
  );
};
