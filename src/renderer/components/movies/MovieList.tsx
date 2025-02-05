import React from "react";
import { Box, Typography } from "@mui/material";
import { VideoDataModel } from "../../../models/videoData.model";
import { trimFileName } from "../../util/helperFunctions";
import { PosterCard } from "../common/PosterCard";

interface MovieListProps {
  movies: VideoDataModel[];
  handlePosterClick: (videoPath: string) => void;
  getImageUrl: (path: string) => string;
  defaultImageUrl: string;
}

const MovieList: React.FC<MovieListProps> = ({
  movies,
  handlePosterClick,
  getImageUrl,
  defaultImageUrl
}) => {
  const getPosterUrl = (movie: VideoDataModel) => {
    return movie.movie_details?.poster_path
      ? getImageUrl(movie.movie_details.poster_path)
      : defaultImageUrl;
  };

  return (
    <Box display="flex" flexWrap="wrap" gap="4px">
      {movies.map((movie) => (
        <PosterCard
          key={movie.filePath}
          imageUrl={getPosterUrl(movie)}
          fallbackUrl={defaultImageUrl}
          altText={movie.fileName || ""}
          onClick={() => handlePosterClick(movie.filePath || "")}
          footer={trimFileName(movie.fileName || "")}
        />
      ))}
    </Box>
  );
};

export default MovieList;
