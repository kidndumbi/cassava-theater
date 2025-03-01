import React from "react";
import { Box, Typography } from "@mui/material";
import { VideoDataModel } from "../../../models/videoData.model";
import { useTmdbImageUrl } from "../../hooks/useImageUrl";
import { getUrl, trimFileName } from "../../util/helperFunctions";
import { VideoProgressBar } from "../common/VideoProgressBar";
import { PosterCard } from "../common/PosterCard";
import MovieDetailsButtons from "../movies/MovieDetailsButtons";
import { useSettings } from "../../hooks/useSettings";

interface ResumeMovieProps {
  movie: VideoDataModel;
  handlePosterClick: (
    videoType: string,
    video: VideoDataModel,
    startFromBeginning: boolean
  ) => void;
}

const ResumeMovie: React.FC<ResumeMovieProps> = ({
  movie,
  handlePosterClick,
}) => {
  const { getTmdbImageUrl } = useTmdbImageUrl();
  const { settings } = useSettings();
  const [showActionButtons, setShowActions] = React.useState(false);

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
            <VideoProgressBar
              current={movie.currentTime || 0}
              total={movie.duration || 0}
            />
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
            top: "65%",
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

export default ResumeMovie;
