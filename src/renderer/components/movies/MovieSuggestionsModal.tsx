import React, { useEffect } from "react";
import { Modal, Typography, Paper, Box, Button } from "@mui/material";
import theme from "../../theme";
import { useMovies } from "../../hooks/useMovies";
import { useTmdbImageUrl } from "../../hooks/useImageUrl";
import { MovieDetails } from "../../../models/movie-detail.model";

interface MovieSuggestionsModalProps {
  open: boolean;
  handleClose: () => void;
  fileName: string;
  id?: string;
  handleSelectMovie: ( movie_details: MovieDetails) => void;
}

const MovieSuggestionsModal: React.FC<MovieSuggestionsModalProps> = ({
  open,
  handleClose,
  fileName,
  id,
  handleSelectMovie,
}) => {
  const { movieSuggestions, getMovieSuggestions, resetMovieSuggestions } =
    useMovies();
  const { getTmdbImageUrl } = useTmdbImageUrl();

  useEffect(() => {
    if (fileName && open) {
      resetMovieSuggestions();
      getMovieSuggestions(fileName);
    }
  }, [fileName, open]);

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
            handleSelectMovie( movie);
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
          maxHeight: "80%",
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
        <Typography variant="h6" component="h2" color="primary">
          Movie Suggestions
        </Typography>
        <Typography sx={{ mt: 2, color: theme.customVariables.appWhiteSmoke }}>
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
      </Paper>
    </Modal>
  );
};

export { MovieSuggestionsModal };
