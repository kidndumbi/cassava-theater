import React from "react";
import { Box, Chip } from "@mui/material";
import { styled } from "@mui/system";
import { VideoDataModel } from "../../../models/videoData.model";
import {
  getFileExtension,
  removeVidExt,
  trimFileName,
} from "../../util/helperFunctions";
import { PosterCard } from "../common/PosterCard";
import { AppMore } from "../common/AppMore";
import { useMovies } from "../../hooks/useMovies";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { useConfirmation } from "../../contexts/ConfirmationContext";
import { MovieSuggestionsModal } from "./MovieSuggestionsModal";
import theme from "../../theme";
import { useMp4Conversion } from "../../hooks/useMp4Conversion";

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

const MovieListItem: React.FC<{
  movie: VideoDataModel;
  onPosterClick: (videoPath: string) => void;
  getImageUrl: (movie: VideoDataModel) => string;
  onDelete: (filePath: string) => void;
  onLinkTheMovieDb: () => void;
  onConvertToMp4: (filePath: string) => void;
}> = ({
  movie,
  onPosterClick,
  getImageUrl,
  onDelete,
  onLinkTheMovieDb,
  onConvertToMp4,
}) => (
  <HoverBox>
    <PosterCard
      imageUrl={getImageUrl(movie)}
      altText={movie.fileName || ""}
      onClick={() => onPosterClick(movie.filePath || "")}
      footer={trimFileName(movie.fileName || "")}
    />
    <HoverContent className="hover-content">
      <AppMore
        isMovie={true}
        handleDelete={() => onDelete(movie.filePath)}
        linkTheMovieDb={onLinkTheMovieDb}
        isNotMp4={!movie.filePath?.endsWith(".mp4")}
        handleConvertToMp4={() => {
          onConvertToMp4(movie.filePath || "");
        }}
      />
    </HoverContent>
    <Box
      className="hover-content"
      sx={{ position: "absolute", top: 9, left: 9, display: "none" }}
    >
      <Chip
        label={getFileExtension(movie.filePath)}
        size="small"
        sx={{
          color: theme.customVariables.appWhiteSmoke,
          backgroundColor: theme.customVariables.appDark,
        }}
      />
    </Box>
  </HoverBox>
);

const MovieList: React.FC<MovieListProps> = ({
  movies,
  handlePosterClick,
  getImageUrl,
}) => {
  const { removeMovie, updateTMDBId } = useMovies();
  const { showSnackbar } = useSnackbar();
  const { openDialog, setMessage } = useConfirmation();
  const [selectedMovie, setSelectedMovie] =
    React.useState<VideoDataModel | null>(null);
  const [openMovieSuggestionsModal, setOpenMovieSuggestionsModal] =
    React.useState(false);

  const { convertToMp4 } = useMp4Conversion();

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

  const handleConvertToMp4 = (fromPath: string) => {
    convertToMp4([fromPath]);
  };

  return (
    <>
      <Box display="flex" flexWrap="wrap" gap="4px">
        {movies.map((movie) => (
          <MovieListItem
            key={movie.filePath}
            movie={movie}
            onPosterClick={handlePosterClick}
            getImageUrl={getImageUrl}
            onDelete={handleDelete}
            onLinkTheMovieDb={() => {
              setSelectedMovie(movie);
              setOpenMovieSuggestionsModal(true);
            }}
            onConvertToMp4={handleConvertToMp4}
          />
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
