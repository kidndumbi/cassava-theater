import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import { PosterCard } from "../common/PosterCard";
import { useTmdbImageUrl } from "../../hooks/useImageUrl";
import { VideoDataModel } from "../../../models/videoData.model";
import { getUrl, trimFileName } from "../../util/helperFunctions";
import MovieDetailsButtons from "../movies/MovieDetailsButtons";
import { useSettings } from "../../hooks/useSettings";

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
  const { getTmdbImageUrl } = useTmdbImageUrl();
  const [showActionButtons, setShowActions] = useState(false);
  const { settings } = useSettings();

  const handlePlay = (startFromBeginning = false) => {
    handlePosterClick("movie", movie, startFromBeginning);
  };

  const getImageUlr = () => {
    if (movie.poster) {
      return getUrl("file", movie.poster, null, settings?.port);
    }
    if (movie?.movie_details?.poster_path) {
      return getTmdbImageUrl(movie.movie_details.poster_path);
    }
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
        imageUrl={getImageUlr()}
        altText={movie.fileName}
        footer={
          <Box sx={{ marginTop: "5px" }}>
            <Typography variant="subtitle1" align="center">
              {trimFileName(movie.fileName ?? "Unknown Title")}
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
