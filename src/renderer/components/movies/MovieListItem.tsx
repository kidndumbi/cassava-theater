import React from "react";
import { trimFileName } from "../../util/helperFunctions";
import { PosterCard } from "../common/PosterCard";
import { AppMore } from "../common/AppMore";
import { HoverBox } from "../common/HoverBox";
import { HoverContent } from "../common/HoverContent";
import { VideoTypeContainer } from "../common/VideoTypeContainer";
import { VideoTypeChip } from "../common/VideoTypeChip";
import { VideoDataModel } from "../../../models/videoData.model";

interface MovieListItemProps {
  movie: VideoDataModel;
  onPosterClick: (videoPath: string) => void;
  getImageUrl: (movie: VideoDataModel) => string;
  onDelete: (filePath: string) => void;
  onLinkTheMovieDb: () => void;
  onConvertToMp4: (filePath: string) => void;
  alwaysShowVideoType: boolean;
  handlePlaylistUpdate: (movie: VideoDataModel) => void;
}

export const MovieListItem: React.FC<MovieListItemProps> = ({
  movie,
  onPosterClick,
  getImageUrl,
  onDelete,
  onLinkTheMovieDb,
  onConvertToMp4,
  alwaysShowVideoType,
  handlePlaylistUpdate,
}) => {
  return (
    <HoverBox>
      <PosterCard
        imageUrl={getImageUrl(movie)}
        altText={movie.fileName || ""}
        onClick={() => onPosterClick(movie.filePath || "")}
        footer={trimFileName(movie.fileName || "")}
      />
      <HoverContent className="hover-content">
        <AppMore
          isMovie={true}
          handleDelete={() => onDelete(movie.filePath)}
          linkTheMovieDb={onLinkTheMovieDb}
          isNotMp4={!movie.filePath?.endsWith(".mp4")}
          handleConvertToMp4={() => onConvertToMp4(movie.filePath || "")}
          videoData={movie}
          handleWatchLaterUpdate={async (filePath, watchLater) => {
            await window.videoAPI.saveVideoJsonData({
              currentVideo: { filePath },
              newVideoJsonData: { watchLater },
            });
          }}
          handlePlaylistUpdate={() => {
            handlePlaylistUpdate(movie);
          }}
        />
      </HoverContent>
      <VideoTypeContainer
        className={!alwaysShowVideoType ? "hover-content" : ""}
        alwaysShow={alwaysShowVideoType}
      >
        <VideoTypeChip filePath={movie.filePath} />
      </VideoTypeContainer>
    </HoverBox>
  );
};
