import React, { useCallback, useState } from "react";
import { Box, Typography } from "@mui/material";
import { VideoDataModel } from "../../../models/videoData.model";
import { useTmdbImageUrl } from "../../hooks/useImageUrl";
import { getUrl, trimFileName } from "../../util/helperFunctions";
import { VideoProgressBar } from "../common/VideoProgressBar";
import { PosterCard } from "../common/PosterCard";
import MovieDetailsButtons from "../movies/MovieDetailsButtons";
import { useConfirmation } from "../../contexts/ConfirmationContext";
import { useGetAllSettings } from "../../hooks/settings/useGetAllSettings";

interface ResumeMovieProps {
  movie: VideoDataModel;
  handlePosterClick: (
    videoType: string,
    video: VideoDataModel,
    startFromBeginning: boolean,
  ) => void;
}

const ResumeMovie: React.FC<ResumeMovieProps> = ({ movie, handlePosterClick }) => {
  const { getTmdbImageUrl } = useTmdbImageUrl();
    const {data:settings} = useGetAllSettings();
  const { openDialog, setMessage } = useConfirmation();
  const [showActionButtons, setShowActions] = useState(false);

  const handlePlay = useCallback(
    async (startFromBeginning = false) => {
      if (startFromBeginning) {
        setMessage("Are you sure you want to start the movie from the beginning?");
        const dialogDecision = await openDialog();
        if (dialogDecision === "Ok") {
          handlePosterClick("movie", movie, startFromBeginning);
        }
        return;
      }
      handlePosterClick("movie", movie, startFromBeginning);
    },
    [handlePosterClick, movie, openDialog, setMessage],
  );

  const imageUrl = useCallback(() => {
    if (movie.poster) {
      return getUrl("file", movie.poster, null, settings?.port);
    }
    if (movie?.movie_details?.poster_path) {
      return getTmdbImageUrl(movie.movie_details.poster_path);
    }
    return undefined;
  }, [movie, settings, getTmdbImageUrl]);

  const handleMouseEnter = useCallback(() => setShowActions(true), []);
  const handleMouseLeave = useCallback(() => setShowActions(false), []);

  return (
    <Box
      className="relative max-w-[200px]"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <PosterCard
        imageUrl={imageUrl()}
        altText={movie.fileName}
        footer={
          <Box className="mt-2">
            <VideoProgressBar current={movie.currentTime || 0} total={movie.duration || 0} />
            <Typography variant="subtitle1" align="center">
              {trimFileName(movie.fileName ?? "Unknown Title")}
            </Typography>
          </Box>
        }
      />
      {showActionButtons && (
        <Box className="absolute left-1/2 top-[65%] -translate-x-1/2 -translate-y-1/2">
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