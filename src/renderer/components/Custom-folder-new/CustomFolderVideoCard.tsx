import React from "react";
import { AppContextMenu } from "../common/AppContextMenu";
import { PosterCard } from "../common/PosterCard";
import { removeVidExt, trimFileName } from "../../util/helperFunctions";
import { VideoDataModel } from "../../../models/videoData.model";
import { OptionsMenuItem } from "./CustomFolderVideosPanel"; // import the interface
import { DragPreviewImage, useDrag } from "react-dnd";
import { useDragPreviewImage } from "../../hooks/useDragPreviewImage";

interface CustomFolderVideoCardProps {
  video: VideoDataModel;
  idx: number;
  getMenuItems: (video: VideoDataModel) => OptionsMenuItem[];
  getImageUrl: (video: VideoDataModel) => string | undefined;
  onClick: (video: VideoDataModel) => void;
  dragging: (isDragging: boolean, idx: number) => void;
}

export const CustomFolderVideoCard: React.FC<CustomFolderVideoCardProps> = ({
  video,
  idx,
  getMenuItems,
  getImageUrl,
  onClick,
  dragging,
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
          <PosterCard
            imageUrl={getImageUrl(video)}
            altText={video.fileName || ""}
            footer={trimFileName(video.fileName || "")}
            onClick={() => onClick(video)}
            currentTime={video.currentTime}
            duration={video.duration}
          />
        </AppContextMenu>
      </div>
    </>
  );
};
