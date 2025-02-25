import React from "react";
import { Box } from "@mui/material";
import { VideoDataModel } from "../../../models/videoData.model";
import { trimFileName } from "../../util/helperFunctions";
import { PosterCard } from "../common/PosterCard";

interface MovieListProps {
  movies: VideoDataModel[];
  handlePosterClick: (videoPath: string) => void;
  getImageUrl: (movie: VideoDataModel) => string;
}

const MovieList: React.FC<MovieListProps> = ({
  movies,
  handlePosterClick,
  getImageUrl,
}) => {
  return (
    <Box display="flex" flexWrap="wrap" gap="4px">
      {movies.map((movie) => (
        <PosterCard
          key={movie.filePath}
          imageUrl={getImageUrl(movie)}
          altText={movie.fileName || ""}
          onClick={() => handlePosterClick(movie.filePath || "")}
          footer={trimFileName(movie.fileName || "")}
        />
      ))}
    </Box>
  );
};

export default MovieList;
