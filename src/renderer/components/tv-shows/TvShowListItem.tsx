import React from "react";
import { VideoDataModel } from "../../../models/videoData.model";
import { PosterCard } from "../common/PosterCard";
import { trimFileName } from "../../util/helperFunctions";
import { DragPreviewImage, useDrag } from "react-dnd";
import { useDragPreviewImage } from "../../hooks/useDragPreviewImage";

interface TvShowListItemProps {
  show: VideoDataModel;
  getImageUrl: (show: VideoDataModel) => string | undefined;
  handlePosterClick: (videoPath: string) => void;
  idx: number;
  dragging: (isDragging: boolean, idx: number) => void;
}

const TvShowListItem: React.FC<TvShowListItemProps> = ({
  show,
  getImageUrl,
  handlePosterClick,
  idx,
  dragging,
}) => {
  const ref = React.useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag, dragPreview] = useDrag({
    type: "VIDEO",
    item: { index: idx, type: "VIDEO", show },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const previewSrc = useDragPreviewImage(show.fileName);

  React.useEffect(() => {
    dragging(isDragging, idx);
  }, [isDragging, dragging, idx]);

  drag(ref);

  return (
    <>
      <DragPreviewImage connect={dragPreview} src={previewSrc} />
      <div ref={ref}>
        <PosterCard
          imageUrl={getImageUrl(show)}
          altText={show.fileName || ""}
          onClick={() => show.filePath && handlePosterClick(show.filePath)}
          footer={trimFileName(show.fileName ?? "")}
        />
      </div>
    </>
  );
};

export default TvShowListItem;
