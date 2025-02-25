import React, { useState } from "react";
import { Box, Button, Modal, Paper, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { VideoDataModel } from "../../../models/videoData.model";
import { useTmdbImageUrl } from "../../hooks/useImageUrl";
import MovieList from "./MovieList";
import LoadingIndicator from "../common/LoadingIndicator";
import { SearchHeader } from "../common/SearchHeader";
import { PosterCard } from "../common/PosterCard";
import { getUrl, trimFileName } from "../../util/helperFunctions";
import { useSettings } from "../../hooks/useSettings";

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
  const { getTmdbImageUrl } = useTmdbImageUrl();
  const navigate = useNavigate();
  const { settings } = useSettings();

  const [filter, setFilter] = useState("");

  const handlePosterClick = (videoPath: string) => {
    navigate(`/video-details?videoPath=${videoPath}&menuId=${menuId}`); // Add menuId to the query string
  };

  const handleRefresh = () => {
    refreshMovies();
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(event.target.value);
  };

  const filteredMovies = movies.filter((movie) => {
    const fileNameWithoutExtension =
      movie.fileName?.replace(/\.(mp4|mkv|avi)$/i, "") || "";
    return fileNameWithoutExtension
      .toLowerCase()
      .includes(filter.toLowerCase());
  });

  const [randomMovie, setRandomMovie] = useState<VideoDataModel | null>(null);

  const getRandomMovie = () => {
    const intervalId = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * filteredMovies.length);
      setRandomMovie(filteredMovies[randomIndex]);
    }, 100);

    setTimeout(() => {
      clearInterval(intervalId);
    }, 2000);
  };

  const getImageUrl = (movie: VideoDataModel) => {
    if (movie?.poster) {
      return getUrl("file", movie.poster, null, settings?.port);
    }
    if (movie?.movie_details?.poster_path) {
      return getTmdbImageUrl(movie.movie_details.poster_path);
    }
  };

  return (
    <Box style={{ ...style, overflowY: "auto" }}>
      <SearchHeader
        onRefresh={handleRefresh}
        filter={filter}
        onFilterChange={handleFilterChange}
        theme={theme}
      />
      <Button variant="outlined" onClick={getRandomMovie}>
        Random Movie
      </Button>

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
        <>
          <MovieList
            movies={filteredMovies}
            handlePosterClick={handlePosterClick}
            getImageUrl={getImageUrl}
          />
          <Modal open={!!randomMovie} onClose={() => setRandomMovie(null)}>
            <Paper
              sx={{
                bgcolor: theme.customVariables.appDarker,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)", // Center the Paper
                position: "absolute",
                boxShadow: 24,
                p: 4,
                color: theme.customVariables.appWhiteSmoke,
                borderRadius: "10px",
                width: "345px",
              }}
            >
              <PosterCard
                imageUrl={getImageUrl(randomMovie)}
                altText={randomMovie?.fileName || ""}
                onClick={() => handlePosterClick(randomMovie?.filePath || "")}
                height="400px"
                width="266px"
                footer={
                  <span>{trimFileName(randomMovie?.fileName || "")}</span>
                }
              />
            </Paper>
          </Modal>
        </>
      )}
    </Box>
  );
};
