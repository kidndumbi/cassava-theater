import React, { useEffect, useState } from "react";
import {
  Modal,
  Typography,
  Paper,
  Box,
  Button,
  Tabs,
  Tab,
} from "@mui/material";
import theme from "../../theme";
import { useMovies } from "../../hooks/useMovies";
import { useTmdbImageUrl } from "../../hooks/useImageUrl";
import { MovieDetails } from "../../../models/movie-detail.model";
import { a11yProps, CustomTabPanel } from "../common/TabPanel";
import { CustomImages } from "../tv-shows/CustomImages";
import { VideoDataModel } from "../../../models/videoData.model";
import { useSnackbar } from "../../contexts/SnackbarContext";
import LoadingIndicator from "../common/LoadingIndicator";
import { AppTextField } from "../common/AppTextField";
import AppIconButton from "../common/AppIconButton";
import SearchIcon from "@mui/icons-material/Search";
import { useMovieSuggestions } from "../../hooks/useMovieSuggestions";
import { useVideoDetailsQuery } from "../../hooks/useVideoData.query";
import { useQueryClient } from "@tanstack/react-query";

interface MovieSuggestionsModalProps {
  open: boolean;
  handleClose: () => void;
  fileName: string;
  id?: string;
  handleSelectMovie: (movie_details: MovieDetails) => void;
  filePath: string;
}

const MovieSuggestionsModal: React.FC<MovieSuggestionsModalProps> = ({
  open,
  handleClose,
  fileName,
  id,
  handleSelectMovie,
  filePath,
}) => {
  const { updateMovieDbData } = useMovies();

  const { data: videoDetails } = useVideoDetailsQuery({
    path: filePath,
    category: "movies",
  });

  const queryClient = useQueryClient();

  const { showSnackbar } = useSnackbar();
  const { getTmdbImageUrl } = useTmdbImageUrl();
  const [currentTabValue, setCurrentTabValue] = useState(0);

  const [movieName, setMovieName] = useState("");
  const [searchQuery, setSearchQuery] = useState(fileName); // new state for search

  const handleMovieNameChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setMovieName(event.target.value);
  };

  const { data: movieSuggestions, isLoading: movieSuggestionsLoading } =
    useMovieSuggestions(searchQuery);

  useEffect(() => {
    if (fileName && open) {
      setMovieName(fileName);
      setSearchQuery(fileName); // update search query
    }
  }, [fileName, open]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTabValue(newValue);
  };

  const handleImageUpdate = async (
    data: VideoDataModel,
    videoDetails: VideoDataModel,
  ) => {
    if (!videoDetails?.filePath) return;
    try {
      await updateMovieDbData(videoDetails.filePath, data);
      queryClient.invalidateQueries({
        queryKey: ["videoDetails", videoDetails.filePath, "movies"],
      });
      showSnackbar("Custom image updated successfully", "success");
    } catch (error) {
      showSnackbar("Failed to update custom image", "error");
    }
  };

  const renderMovieCard = (movie: MovieDetails) => {
    const isSelected = movie?.id?.toString() === id;

    return (
      <Box
        key={movie.id}
        sx={{
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        <img
          src={getTmdbImageUrl(movie?.poster_path || "", "w300")}
          alt={movie.title}
          style={{ width: 150, height: 225 }}
          loading="lazy"
        />
        {isSelected ? (
          <Typography
            variant="body2"
            sx={{ color: theme.customVariables.appWhiteSmoke }}
          >
            Selected
          </Typography>
        ) : (
          <Button
            variant="contained"
            onClick={() => {
              handleSelectMovie(movie);
              handleClose();
            }}
          >
            Select
          </Button>
        )}
      </Box>
    );
  };

  const renderTabContent = () => {
    if (currentTabValue === 0) {
      return movieSuggestionsLoading ? (
        <Box className="mt-[15%]">
          <LoadingIndicator />
        </Box>
      ) : (
        <>
          <Typography variant="h6" component="h2" color="primary">
            Movie Suggestions
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <AppTextField
              label="TV Show Name"
              value={movieName}
              onChange={handleMovieNameChange}
              theme={theme}
            />
            <AppIconButton
              tooltip="theMovieDb data"
              onClick={() => {
                setSearchQuery(movieName.trim());
              }}
            >
              <SearchIcon />
            </AppIconButton>
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 2 }}>
            {movieSuggestions?.map(renderMovieCard)}
          </Box>
        </>
      );
    }

    return (
      <CustomImages
        posterUrl={videoDetails?.poster}
        backdropUrl={videoDetails?.backdrop}
        updateImage={(data) => {
          handleImageUpdate(data, videoDetails);
        }}
      />
    );
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Paper
        sx={{
          height: "80%",
          overflowY: "auto",
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "80%",
          bgcolor: theme.customVariables.appDark,
          color: theme.customVariables.appWhiteSmoke,
          boxShadow: 24,
          p: 4,
        }}
      >
        <Tabs
          value={currentTabValue}
          onChange={handleTabChange}
          aria-label="movie suggestion tabs"
          TabIndicatorProps={{
            style: {
              backgroundColor: "primary",
            },
          }}
        >
          <Tab
            label="TheMovieDb"
            {...a11yProps(0)}
            sx={{
              color:
                currentTabValue === 0
                  ? "primary.main"
                  : theme.customVariables.appWhiteSmoke,
            }}
          />
          <Tab
            label="Customize"
            {...a11yProps(1)}
            sx={{
              color:
                currentTabValue === 1
                  ? "primary.main"
                  : theme.customVariables.appWhiteSmoke,
            }}
          />
        </Tabs>
        <CustomTabPanel value={currentTabValue} index={0}>
          {renderTabContent()}
        </CustomTabPanel>
        <CustomTabPanel value={currentTabValue} index={1}>
          {renderTabContent()}
        </CustomTabPanel>
      </Paper>
    </Modal>
  );
};

export { MovieSuggestionsModal };
