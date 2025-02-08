import React from "react";
import { Box, Typography } from "@mui/material";
import { VideoDataModel } from "../../../models/videoData.model";
import { useTmdbImageUrl } from "../../hooks/useImageUrl";
import { trimFileName } from "../../util/helperFunctions";
import { VideoProgressBar } from "../common/VideoProgressBar";
import { PosterCard } from "../common/PosterCard";
import MovieDetailsButtons from "../movies/MovieDetailsButtons";

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
  const [showActionButtons, setShowActions] = React.useState(false);

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
            && getTmdbImageUrl(movie.movie_details.poster_path)
         
        }
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

export default ResumeMovie;
