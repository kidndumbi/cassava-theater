import React, { useState } from "react";
import { Box, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { VideoDataModel } from "../../../models/videoData.model";
import { useTmdbImageUrl } from "../../hooks/useImageUrl";
import MovieList from "./MovieList";
import LoadingIndicator from "../common/LoadingIndicator";
import { SearchHeader } from "../common/SearchHeader";

interface MoviesProps {
  movies: VideoDataModel[];
  loadingMovies: boolean;
  style?: React.CSSProperties;
  refreshMovies: () => void;
  menuId: string;
}

export const Movies: React.FC<MoviesProps> = ({
  movies,
  style,
  refreshMovies,
  loadingMovies,
  menuId,
}) => {
  const theme = useTheme();
  const { getTmdbImageUrl, defaultImageUrl } = useTmdbImageUrl();
  const navigate = useNavigate();

  const [filter, setFilter] = useState("");

  const handlePosterClick = ( videoPath: string) => {
    navigate(`/video-details?videoPath=${videoPath}&menuId=${menuId}`); // Add menuId to the query string
  };

  const handleRefresh = () => {
    refreshMovies();
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(event.target.value);
  };

  const filteredMovies = movies.filter((movie) => {
    const fileNameWithoutExtension = movie.fileName!.replace(/\.mp4$/, "");
    return fileNameWithoutExtension
      .toLowerCase()
      .includes(filter.toLowerCase());
  });

  return (
    <Box style={{ ...style, overflowY: "auto" }}>
      <SearchHeader
        onRefresh={handleRefresh}
        filter={filter}
        onFilterChange={handleFilterChange}
        theme={theme}
      />

      {loadingMovies ? (
        <LoadingIndicator message="Loading..." />
      ) : filteredMovies.length === 0 ? (
        <Box
          display="flex"
          justifyContent="center"
          height="100vh"
          paddingTop="3rem"
        >
          <Box fontSize="2rem">No Movies to display</Box>
        </Box>
      ) : (
        <MovieList
          movies={filteredMovies}
          handlePosterClick={handlePosterClick}
          getImageUrl={getTmdbImageUrl}
          defaultImageUrl={defaultImageUrl}
        />
      )}
    </Box>
  );
};
