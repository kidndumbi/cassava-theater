import React from "react";
import { Box, Divider, Typography, useTheme } from "@mui/material";
import { VideoDataModel } from "../../../models/videoData.model";
import { useTmdbImageUrl } from "../../hooks/useImageUrl";
import { trimFileName } from "../../util/helperFunctions";
import { VideoProgressBar } from "../common/VideoProgressBar";
import LoadingIndicator from "../common/LoadingIndicator";

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
      <Box key={movie.filePath} sx={{ position: "relative" }}>
        <img
          src={
            movie?.movie_details?.poster_path
              ? getTmdbImageUrl(movie.movie_details.poster_path)
              : defaultImageUrl
          }
          alt={movie.fileName}
          style={{
            width: "200px",
            height: "auto",
            borderRadius: "10px",
            cursor: "pointer",
          }}
          onClick={() => handlePosterClick("movie", movie)}
          onError={(e) => {
            e.currentTarget.style.display = "none";
            const nextSibling = e.currentTarget
              .nextElementSibling as HTMLElement;
            if (nextSibling) {
              nextSibling.style.display = "block";
            }
          }}
        />
        <Box>
          <Box sx={{ marginTop: "5px" }}>
            <VideoProgressBar
              current={movie.currentTime || 0}
              total={movie.duration || 0}
            />
          </Box>
        </Box>
        <Typography variant="subtitle1" align="center">
          {trimFileName(movie.fileName!)}
        </Typography>
      </Box>
    ));
  };

  return (
    <>
      <Typography
        variant="h6"
        gutterBottom
        sx={{
          color: theme.customVariables.appWhiteSmoke,
          fontWeight: "bold",
        }}
      >
        Resume watching These Movies
      </Typography>
      <Divider
        sx={{
          marginY: 2,
          borderColor: theme.palette.primary.main,
          marginRight: 2,
        }}
      />
      <Box
        className="custom-scrollbar"
        display="flex"
        gap="8px"
        sx={{ maxWidth: "calc(100vw - 30px)", overflowY: "auto" }}
      >
        {renderMovies()}
      </Box>
    </>
  );
};

export default ResumeMovieList;
