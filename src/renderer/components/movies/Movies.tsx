import React, { useState, useCallback, useMemo } from "react";
import { Alert, Box, Button, Modal, Paper, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { VideoDataModel } from "../../../models/videoData.model";
import { useTmdbImageUrl } from "../../hooks/useImageUrl";
import MovieList from "./MovieList";
import LoadingIndicator from "../common/LoadingIndicator";
import { SearchHeader } from "../common/SearchHeader";
import { PosterCard } from "../common/PosterCard";
import { getUrl, removeVidExt, trimFileName } from "../../util/helperFunctions";
import { useGetAllSettings } from "../../hooks/settings/useGetAllSettings";
import { useConfirmation } from "../../contexts/ConfirmationContext";
import WarningIcon from "@mui/icons-material/Warning";

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
  const { data: settings } = useGetAllSettings();
  const { openDialog, setMessage } = useConfirmation();

  const [filter, setFilter] = useState("");

  const handlePosterClick = useCallback(
    async (videoPath: string) => {
      const isNotMp4 = !videoPath.toLowerCase().endsWith(".mp4");
      if (isNotMp4 && settings && settings.playNonMp4Videos === false) {
        setMessage(
          <Alert icon={<WarningIcon fontSize="inherit" />} severity="warning">
            "Playback of non-MP4 videos is currently disabled in settings. To
            play this video, please enable playback of non-MP4 videos in the
            settings."
          </Alert>,
        );
        await openDialog(undefined,true);
        return;
      }

      navigate(`/video-details?videoPath=${videoPath}&menuId=${menuId}`);
    },
    [
      navigate,
      menuId,
      settings?.playNonMp4Videos,
      openDialog,
      setMessage,
      settings,
    ],
  );

  const handleRefresh = useCallback(() => {
    refreshMovies();
  }, [refreshMovies]);

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(event.target.value);
  };

  const filteredMovies = useMemo(() => {
    const fileNameFilter = filter.toLowerCase();
    return movies?.filter((movie) => {
      const fileNameWithoutExtension = removeVidExt(movie.fileName) || "";
      return fileNameWithoutExtension.toLowerCase().includes(fileNameFilter);
    });
  }, [movies, filter]);

  const [randomMovie, setRandomMovie] = useState<VideoDataModel | null>(null);

  const getRandomMovie = () => {
    const intervalId = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * movies?.length);
      setRandomMovie(movies[randomIndex]);
    }, 100);

    setTimeout(() => {
      clearInterval(intervalId);
    }, 2000);
  };

  const getImageUrl = useCallback(
    (movie: VideoDataModel) => {
      if (movie?.poster) {
        return getUrl("file", movie.poster, null, settings?.port);
      }
      if (movie?.movie_details?.poster_path) {
        return getTmdbImageUrl(movie.movie_details.poster_path);
      }
    },
    [getTmdbImageUrl, settings?.port],
  );

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
      ) : filteredMovies?.length === 0 ? (
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
            refetchMovies={handleRefresh}
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
