import React from "react";
import { Box } from "@mui/material";
import { VideoDataModel } from "../../../models/videoData.model";
import { getUrl, trimFileName } from "../../util/helperFunctions";
import { PosterCard } from "../common/PosterCard";
import { useSettings } from "../../hooks/useSettings";

interface MovieListProps {
  movies: VideoDataModel[];
  handlePosterClick: (videoPath: string) => void;
  getImageUrl: (path: string) => string;
}

const MovieList: React.FC<MovieListProps> = ({
  movies,
  handlePosterClick,
  getImageUrl,
}) => {
  const { settings } = useSettings();

  const getImageUlr = (movie: VideoDataModel) => {
    if (movie.poster) {
      return getUrl("file", movie.poster, null, settings?.port);
    }
    if (movie?.movie_details?.poster_path) {
      return getImageUrl(movie.movie_details.poster_path);
    }
  };

  return (
    <Box display="flex" flexWrap="wrap" gap="4px">
      {movies.map((movie) => (
        <PosterCard
          key={movie.filePath}
          imageUrl={getImageUlr(movie)}
          altText={movie.fileName || ""}
          onClick={() => handlePosterClick(movie.filePath || "")}
          footer={trimFileName(movie.fileName || "")}
        />
      ))}
    </Box>
  );
};

export default MovieList;
