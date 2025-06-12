import React, { useCallback, useState } from "react";
import { Box, Typography } from "@mui/material";
import { PosterCard } from "../common/PosterCard";
import { useTmdbImageUrl } from "../../hooks/useImageUrl";
import { VideoDataModel } from "../../../models/videoData.model";
import { getUrl, removeVidExt, trimFileName } from "../../util/helperFunctions";
import MovieDetailsButtons from "../movies/MovieDetailsButtons";
import { useGetAllSettings } from "../../hooks/settings/useGetAllSettings";
import { AppContextMenu } from "../common/AppContextMenu";

interface WatchLaterMovieCardProps {
  movie: VideoDataModel;
  handlePosterClick: (
    videoType: string,
    video: VideoDataModel,
    startFromBeginning: boolean,
  ) => void;
  onRemoveFromWatchLater: (video: VideoDataModel) => void;
}

export const WatchLater: React.FC<WatchLaterMovieCardProps> = ({
  movie,
  handlePosterClick,
  onRemoveFromWatchLater,
}) => {
  const { getTmdbImageUrl } = useTmdbImageUrl();
  const [showActionButtons, setShowActions] = useState(false);
  const { data: settings } = useGetAllSettings();

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

  const getMenuItems = useCallback(
    (movie: VideoDataModel) => [
      {
        label: "Remove from Watch Later",
        action: () => {
          onRemoveFromWatchLater(movie);
        },
      },
    ],
    [movie],
  );

  return (
    <Box
      className="relative max-w-[200px]"
      onMouseEnter={() => {
        setShowActions(true);
      }}
      onMouseLeave={() => {
        setShowActions(false);
      }}
    >
      <AppContextMenu
        key={movie.filePath}
        title={removeVidExt(movie.fileName ?? "")}
        menuItems={getMenuItems(movie)}
      >
        <PosterCard
          imageUrl={getImageUlr()}
          altText={movie.fileName}
          footer={
            <Box className="mt-2">
              <Typography variant="subtitle1" align="center">
                {trimFileName(movie.fileName ?? "Unknown Title")}
              </Typography>
            </Box>
          }
          currentTime={movie.currentTime}
          duration={movie.duration}
        />
      </AppContextMenu>

      {showActionButtons && (
        <Box className="absolute left-1/2 top-[65%] -translate-x-1/2 -translate-y-1/2 transform">
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
