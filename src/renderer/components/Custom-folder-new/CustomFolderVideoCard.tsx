import React from "react";
import { AppContextMenu } from "../common/AppContextMenu";
import { PosterCard } from "../common/PosterCard";
import { removeVidExt, trimFileName } from "../../util/helperFunctions";
import { VideoDataModel } from "../../../models/videoData.model";
import { OptionsMenuItem } from "./CustomFolderVideosPanel"; // import the interface
import { DragPreviewImage, useDrag } from "react-dnd";
import { useDragPreviewImage } from "../../hooks/useDragPreviewImage";
import { ListDisplayType } from "../../../models/playlist.model";
import { VideoListItem } from "../common/VideoListItem";

interface CustomFolderVideoCardProps {
  video: VideoDataModel;
  idx: number;
  getMenuItems: (video: VideoDataModel) => OptionsMenuItem[];
  getImageUrl: (video: VideoDataModel) => string | undefined;
  onClick: (video: VideoDataModel) => void;
  dragging: (isDragging: boolean, idx: number) => void;
  displayType: ListDisplayType;
}

export const CustomFolderVideoCard: React.FC<CustomFolderVideoCardProps> = ({
  video,
  idx,
  getMenuItems,
  getImageUrl,
  onClick,
  dragging,
  displayType,
}) => {
  const ref = React.useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag, dragPreview] = useDrag({
    type: "VIDEO",
    item: { index: idx, type: "VIDEO", video },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const previewSrc = useDragPreviewImage(video.fileName);

  React.useEffect(() => {
    dragging(isDragging, idx);
  }, [isDragging, dragging, idx]);

  drag(ref);

  return (
    <>
      <DragPreviewImage connect={dragPreview} src={previewSrc} />
      <div ref={ref}>
        <AppContextMenu
          key={video.filePath || idx}
          title={removeVidExt(video.fileName)}
          menuItems={getMenuItems(video)}
        >
          {displayType === "grid" ? (
            <PosterCard
              imageUrl={getImageUrl(video)}
              altText={video.fileName || ""}
              footer={trimFileName(video.fileName || "")}
              onClick={() => onClick(video)}
              currentTime={video.currentTime}
              duration={video.duration}
            />
          ) : (
            <VideoListItem
              video={video}
              getImageUrl={getImageUrl}
              onClick={onClick}
            />
          )}
        </AppContextMenu>
      </div>
    </>
  );
};
