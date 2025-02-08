import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import { PosterCard } from "../common/PosterCard";
import { useTmdbImageUrl } from "../../hooks/useImageUrl";
import { VideoDataModel } from "../../../models/videoData.model";
import { trimFileName } from "../../util/helperFunctions";
import MovieDetailsButtons from "../movies/MovieDetailsButtons";

interface WatchLaterMovieCardProps {
  movie: VideoDataModel;
  handlePosterClick: (
    videoType: string,
    video: VideoDataModel,
    startFromBeginning: boolean
  ) => void;
}

export const WatchLater: React.FC<WatchLaterMovieCardProps> = ({
  movie,
  handlePosterClick,
}) => {
  const { getTmdbImageUrl, defaultImageUrl } = useTmdbImageUrl();
  const [showActionButtons, setShowActions] = useState(false);

  const handlePlay = (startFromBeginning = false) => {
    handlePosterClick("movie", movie, startFromBeginning);
  };

  return (
    <Box
      sx={{ position: "relative", maxWidth: "200px" }}
      onMouseEnter={() => {
        setShowActions(true);
      }}
      onMouseLeave={() => {
        setShowActions(false);
      }}
    >
      <PosterCard
        imageUrl={
          movie?.movie_details?.poster_path
            ? getTmdbImageUrl(movie.movie_details.poster_path)
            : defaultImageUrl
        }
        altText={movie.fileName}
        footer={
          <Box sx={{ marginTop: "5px" }}>
            <Typography variant="subtitle1" align="center">
              {trimFileName(movie.fileName!)}
            </Typography>
          </Box>
        }
      />
      {showActionButtons && (
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <MovieDetailsButtons
            playText=""
            resumeText=""
            startFromBeginningText=""
            videoDetails={movie}
            handlePlay={handlePlay}
          />
        </Box>
      )}
    </Box>
  );
};
