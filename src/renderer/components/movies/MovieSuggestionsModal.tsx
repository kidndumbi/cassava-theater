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

interface MovieSuggestionsModalProps {
  open: boolean;
  handleClose: () => void;
  fileName: string;
  id?: string;
  handleSelectMovie: (movie_details: MovieDetails) => void;
}

const MovieSuggestionsModal: React.FC<MovieSuggestionsModalProps> = ({
  open,
  handleClose,
  fileName,
  id,
  handleSelectMovie,
}) => {
  const {
    movieSuggestions,
    getMovieSuggestions,
    resetMovieSuggestions,
    videoDetails,
    updateMovieDbData,
    movieSuggestionsLoading,
  } = useMovies();
  const { showSnackbar } = useSnackbar();
  const { getTmdbImageUrl } = useTmdbImageUrl();
  const [currentTabValue, setCurrentTabValue] = useState(0);

  useEffect(() => {
    if (fileName && open) {
      resetMovieSuggestions();
      getMovieSuggestions(fileName);
    }
  }, [fileName, open]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTabValue(newValue);
  };

  const renderMovie = (movie: MovieDetails) => (
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
      />
      {movie?.id?.toString() === id ? (
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
          }}
        >
          Select
        </Button>
      )}
    </Box>
  );

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
          onChange={handleChange}
          aria-label="basic tabs example"
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
          {movieSuggestionsLoading ? (
            <Box className="mt-[15%]">
              <LoadingIndicator />
            </Box>
          ) : (
            <>
              <Typography variant="h6" component="h2" color="primary">
                Movie Suggestions
              </Typography>
              <Typography
                sx={{ mt: 2, color: theme.customVariables.appWhiteSmoke }}
              >
                {fileName}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 2,
                  mt: 2,
                }}
              >
                {movieSuggestions.map(renderMovie)}
              </Box>
            </>
          )}
        </CustomTabPanel>
        <CustomTabPanel value={currentTabValue} index={1}>
          <CustomImages
            posterUrl={videoDetails?.poster}
            backdropUrl={videoDetails?.backdrop}
            updateImage={async (data: VideoDataModel) => {
              await updateMovieDbData(videoDetails.filePath, data);
              showSnackbar("Custom image updated successfully", "success");
            }}
          />
        </CustomTabPanel>
      </Paper>
    </Modal>
  );
};

export { MovieSuggestionsModal };
