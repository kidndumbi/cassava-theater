import React from "react";
import { trimFileName } from "../../util/helperFunctions";
import { PosterCard } from "../common/PosterCard";
import { HoverBox } from "../common/HoverBox";
import { HoverContent } from "../common/HoverContent";
import { VideoTypeContainer } from "../common/VideoTypeContainer";
import { VideoTypeChip } from "../common/VideoTypeChip";
import { VideoDataModel } from "../../../models/videoData.model";
import { DragPreviewImage, useDrag } from "react-dnd";
import { useDragPreviewImage } from "../../hooks/useDragPreviewImage";

interface MovieListItemProps {
  movie: VideoDataModel;
  onPosterClick: (videoPath: string) => void;
  getImageUrl: (movie: VideoDataModel) => string;
  alwaysShowVideoType: boolean;
  onContextMenu?: (event: React.MouseEvent) => void;
  idx: number;
  dragging: (isDragging: boolean, idx: number) => void;
}

export const MovieListItem: React.FC<MovieListItemProps> = ({
  movie,
  onPosterClick,
  getImageUrl,
  alwaysShowVideoType,
  onContextMenu,
  idx,
  dragging,
}) => {
  const ref = React.useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag, dragPreview] = useDrag({
    type: "VIDEO",
    item: { index: idx, type: "VIDEO", movie },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const previewSrc = useDragPreviewImage(movie.fileName);

  React.useEffect(() => {
    dragging(isDragging, idx);
  }, [isDragging, dragging, idx]);

  drag(ref);

  return (
    <>
      <DragPreviewImage connect={dragPreview} src={previewSrc} />
      <div ref={ref}>
        <HoverBox onContextMenu={onContextMenu}>
          <PosterCard
            imageUrl={getImageUrl(movie)}
            altText={movie.fileName || ""}
            onClick={() => onPosterClick(movie.filePath || "")}
            footer={trimFileName(movie.fileName || "")}
          />
          <HoverContent className="hover-content" />
          <VideoTypeContainer
            className={!alwaysShowVideoType ? "hover-content" : ""}
            alwaysShow={alwaysShowVideoType}
          >
            <VideoTypeChip filePath={movie.filePath} />
          </VideoTypeContainer>
        </HoverBox>
      </div>
    </>
  );
};
