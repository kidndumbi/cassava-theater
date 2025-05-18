import * as React from "react";
import theme from "../../theme";
import { useDrag, useDrop } from "react-dnd";
import { VideoDataModel } from "../../../models/videoData.model";
import { AppContextMenu } from "../common/AppContextMenu";
import { PosterCard } from "../common/PosterCard";
import { removeVidExt, trimFileName } from "../../util/helperFunctions";

interface DragItem {
  index: number;
  type: string;
}

export const DraggableVideo: React.FC<{
  video: VideoDataModel;
  idx: number;
  getImageUrl: (video: VideoDataModel) => string | undefined;
  onPlayVideo: (videoIndex: number) => void;
  handleRemove: (videoIdx: number) => void;
  handleInfo: (videoIdx: number) => void;
  moveVideo: (from: number, to: number) => void;
}> = ({
  video,
  idx,
  getImageUrl,
  onPlayVideo,
  handleRemove,
  handleInfo,
  moveVideo,
}) => {
  const ref = React.useRef<HTMLDivElement>(null);

  const [{ isOver }, drop] = useDrop<DragItem, void, { isOver: boolean }>({
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

  const [{ opacity }, drag] = useDrag({
    type: "VIDEO",
    item: { index: idx, type: "VIDEO" },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
      opacity: monitor.isDragging() ? 0.5 : 1,
    }),
  });

  drag(drop(ref));

  return (
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
          <PosterCard
            imageUrl={getImageUrl(video)}
            altText={video.fileName || ""}
            footer={trimFileName(video.fileName || "")}
            onClick={() => onPlayVideo(idx)}
          />
        </div>
      </AppContextMenu>
    </div>
  );
};
