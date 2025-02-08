import { FC } from "react";
import { VideoDataModel } from "../../../models/videoData.model";
import { PosterList } from "./PosterList";
import LoadingIndicator from "../common/LoadingIndicator";
import { Box, Typography } from "@mui/material";
import { PosterCard } from "../common/PosterCard";
import { useTmdbImageUrl } from "../../hooks/useImageUrl";
import { trimFileName } from "../../util/helperFunctions";

interface WatchLaterProps {
  movies: VideoDataModel[];
  tvShows: VideoDataModel[];
  loadingMovies: boolean;
  handlePosterClick: (videoType: string, video: VideoDataModel) => void;
}

export const WatchLater: FC<WatchLaterProps> = ({
  movies,
  loadingMovies,
  handlePosterClick,
}) => {
  const { getTmdbImageUrl, defaultImageUrl } = useTmdbImageUrl();

  const watchLaterMovies = movies.filter((movie) => movie.watchLater);

  const renderMovies = () => {
    if (loadingMovies) {
      return <LoadingIndicator message="Loading movies..." />;
    }

    if (watchLaterMovies.length === 0) {
      return (
        <Box display="flex" justifyContent="center" paddingY="2rem">
          <Box fontSize="2rem">No Movies to display</Box>
        </Box>
      );
    }

    return watchLaterMovies.map((movie, index) => (
      <Box
        key={movie.filePath}
        sx={{ position: "relative", maxWidth: "200px" }}
      >
        <PosterCard
          imageUrl={
            movie?.movie_details?.poster_path
              ? getTmdbImageUrl(movie.movie_details.poster_path)
              : defaultImageUrl
          }
          altText={movie.fileName}
          onClick={() => handlePosterClick("movie", movie)}
          footer={
            <Box sx={{ marginTop: "5px" }}>
              <Typography variant="subtitle1" align="center">
                {trimFileName(movie.fileName!)}
              </Typography>
            </Box>
          }
        />
      </Box>
    ));
  };

  return <PosterList>{renderMovies()}</PosterList>;
};
