import React from "react";
import { Box, Divider, Typography, useTheme } from "@mui/material";
import { VideoDataModel } from "../../../models/videoData.model";
import { useTmdbImageUrl } from "../../hooks/useImageUrl";
import { trimFileName } from "../../util/helperFunctions";
import { VideoProgressBar } from "../common/VideoProgressBar";
import LoadingIndicator from "../common/LoadingIndicator";
import { PosterCard } from "../common/PosterCard"; // new import
import { PosterList } from "./PosterList";

interface ResumeMovieListProps {
  sortedMovies: VideoDataModel[];
  handlePosterClick: (videoType: string, video: VideoDataModel) => void;
  loadingMovies: boolean;
}

const ResumeMovieList: React.FC<ResumeMovieListProps> = ({
  sortedMovies,
  handlePosterClick,
  loadingMovies,
}) => {
  const theme = useTheme();
  const { getTmdbImageUrl, defaultImageUrl } = useTmdbImageUrl();

  const renderMovies = () => {
    if (loadingMovies) {
      return <LoadingIndicator message="Loading movies..." />;
    }

    if (sortedMovies.length === 0) {
      return (
        <Box display="flex" justifyContent="center" paddingY="2rem">
          <Box fontSize="2rem">No Movies to display</Box>
        </Box>
      );
    }

    return sortedMovies.map((movie: VideoDataModel) => (
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
          fallbackUrl={defaultImageUrl}
          altText={movie.fileName}
          onClick={() => handlePosterClick("movie", movie)}
          footer={
            <Box sx={{ marginTop: "5px" }}>
              <VideoProgressBar
                current={movie.currentTime || 0}
                total={movie.duration || 0}
              />
              <Typography variant="subtitle1" align="center">
                {trimFileName(movie.fileName!)}
              </Typography>
            </Box>
          }
        />
      </Box>
    ));
  };

  return (
    <>
      <PosterList>{renderMovies()}</PosterList>
    </>
  );
};

export default ResumeMovieList;
