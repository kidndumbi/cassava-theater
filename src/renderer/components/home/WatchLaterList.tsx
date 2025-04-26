import { FC } from "react";
import { VideoDataModel } from "../../../models/videoData.model";
import { PosterList } from "./PosterList";
import LoadingIndicator from "../common/LoadingIndicator";
import { Box } from "@mui/material";
import { WatchLater } from "./WatchLater";

interface WatchLaterProps {
  movies: VideoDataModel[];
  tvShows: VideoDataModel[];
  loadingMovies: boolean;
  handlePosterClick: (videoType: string, video: VideoDataModel) => void;
}

export const WatchLaterList: FC<WatchLaterProps> = ({
  movies,
  loadingMovies,
  handlePosterClick,
}) => {
  const watchLaterMovies = movies?.filter((movie) => movie.watchLater);

  const renderMovies = () => {
    if (loadingMovies) {
      return <LoadingIndicator message="Loading movies..." />;
    }

    if (!watchLaterMovies || watchLaterMovies.length === 0) {
      return (
        <Box display="flex" justifyContent="center" paddingY="2rem">
          <Box fontSize="2rem">No Movies to display</Box>
        </Box>
      );
    }

    return watchLaterMovies.map((movie) => (
      <WatchLater
        key={movie.filePath}
        movie={movie}
        handlePosterClick={handlePosterClick}
      />
    ));
  };

  return <PosterList>{renderMovies()}</PosterList>;
};
