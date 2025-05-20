import { FC } from "react";
import { VideoDataModel } from "../../../models/videoData.model";
import { PosterList } from "./PosterList";
import LoadingIndicator from "../common/LoadingIndicator";
import { Box } from "@mui/material";
import { WatchLater } from "./WatchLater";

interface WatchLaterProps {
  watchLaterVideos: VideoDataModel[];
  loadingWatchLater: boolean;
  handlePosterClick: (videoType: string, video: VideoDataModel) => void;
}

export const WatchLaterList: FC<WatchLaterProps> = ({
  watchLaterVideos,
  loadingWatchLater,
  handlePosterClick,
}) => {
  const renderMovies = () => {
    if (loadingWatchLater) {
      return <LoadingIndicator message="Loading movies..." />;
    }

    if (!watchLaterVideos || watchLaterVideos.length === 0) {
      return (
        <Box display="flex" justifyContent="center" paddingY="2rem">
          <Box fontSize="2rem">No Movies to display</Box>
        </Box>
      );
    }

    return watchLaterVideos.map((movie) => (
      <WatchLater
        key={movie.filePath}
        movie={movie}
        handlePosterClick={handlePosterClick}
      />
    ));
  };

  return <PosterList>{renderMovies()}</PosterList>;
};
