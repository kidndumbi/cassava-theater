import React from "react";
import { Box } from "@mui/material";
import { styled } from "@mui/system";
import { VideoDataModel } from "../../../models/videoData.model";
import { removeVidExt, trimFileName } from "../../util/helperFunctions";
import { PosterCard } from "../common/PosterCard";
import { AppMore } from "../common/AppMore";
import { useMovies } from "../../hooks/useMovies";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { useConfirmation } from "../../contexts/ConfirmationContext";
import { MovieSuggestionsModal } from "./MovieSuggestionsModal";

interface MovieListProps {
  movies: VideoDataModel[];
  handlePosterClick: (videoPath: string) => void;
  getImageUrl: (movie: VideoDataModel) => string;
}

const HoverBox = styled(Box)({
  position: "relative",
  "&:hover .hover-content": {
    display: "block",
  },
});

const HoverContent = styled(Box)({
  position: "absolute",
  top: 9,
  right: 9,
  display: "none",
});

const MovieList: React.FC<MovieListProps> = ({
  movies,
  handlePosterClick,
  getImageUrl,
}) => {
  const { removeMovie } = useMovies();
  const { showSnackbar } = useSnackbar();
  const { openDialog, setMessage } = useConfirmation();
  const { updateTMDBId } = useMovies();
  const [selectedMovie, setSelectedMovie] =
    React.useState<VideoDataModel | null>(null);
  const [openMovieSuggestionsModal, setOpenMovieSuggestionsModal] =
    React.useState(false);

  const handleDelete = async (filePath: string) => {
    setMessage("Are you sure you want to delete this Movie?");
    const dialogDecision = await openDialog("Delete");

    if (dialogDecision === "Ok") {
      try {
        const del = await window.fileManagerAPI.deleteFile(filePath);
        if (del.success) {
          removeMovie(filePath);
          showSnackbar("Movie deleted successfully", "success");
        } else {
          showSnackbar("Failed to delete Movie: " + del.message, "error");
        }
      } catch (error) {
        showSnackbar("Error deleting Movie: " + error, "error");
      }
    }
  };

  return (
    <>
      <Box display="flex" flexWrap="wrap" gap="4px">
        {movies.map((movie) => (
          <HoverBox key={movie.filePath}>
            <PosterCard
              imageUrl={getImageUrl(movie)}
              altText={movie.fileName || ""}
              onClick={() => handlePosterClick(movie.filePath || "")}
              footer={trimFileName(movie.fileName || "")}
            />
            <HoverContent className="hover-content">
              <AppMore
                isMovie={true}
                handleDelete={handleDelete.bind(null, movie.filePath)}
                linkTheMovieDb={() => {
                  setSelectedMovie(movie);
                  setOpenMovieSuggestionsModal(true);
                }}
              />
            </HoverContent>
          </HoverBox>
        ))}
      </Box>

      <MovieSuggestionsModal
        id={selectedMovie?.movie_details?.id?.toString() || ""}
        open={openMovieSuggestionsModal}
        handleClose={() => {
          setOpenMovieSuggestionsModal(false);
          setSelectedMovie(null);
        }}
        fileName={removeVidExt(selectedMovie?.fileName) || ""}
        handleSelectMovie={async (movie_details) => {
          if (movie_details.id) {
            await updateTMDBId(selectedMovie.filePath || "", movie_details);
            showSnackbar("Movie linked to TMDB successfully", "success");
            setOpenMovieSuggestionsModal(false);
          }
        }}
      />
    </>
  );
};

export default MovieList;
