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
import { useMp4Conversion } from "../../hooks/useMp4Conversion";
import { useSettings } from "../../hooks/useSettings";
import { VideoTypeChip } from "../common/VideoTypeChip";
import { MovieDetails } from "../../../models/movie-detail.model";

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

const VideoTypeContainer = styled(Box)(({ alwaysShow }: { alwaysShow: boolean }) => ({
  position: "absolute",
  top: 9,
  left: 9,
  display: alwaysShow ? "block" : "none",
  "&.hover-content": {
    display: alwaysShow ? "block" : "none",
  },
}));

interface MovieListItemProps {
  movie: VideoDataModel;
  onPosterClick: (videoPath: string) => void;
  getImageUrl: (movie: VideoDataModel) => string;
  onDelete: (filePath: string) => void;
  onLinkTheMovieDb: () => void;
  onConvertToMp4: (filePath: string) => void;
  alwaysShowVideoType: boolean;
}

const MovieListItem: React.FC<MovieListItemProps> = ({
  movie,
  onPosterClick,
  getImageUrl,
  onDelete,
  onLinkTheMovieDb,
  onConvertToMp4,
  alwaysShowVideoType,
}) => {
  return (
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
          handleConvertToMp4={() => onConvertToMp4(movie.filePath || "")}
        />
      </HoverContent>
      
      <VideoTypeContainer 
        className={!alwaysShowVideoType ? "hover-content" : ""}
        alwaysShow={alwaysShowVideoType}
      >
        <VideoTypeChip filePath={movie.filePath} />
      </VideoTypeContainer>
    </HoverBox>
  );
};

const MovieList: React.FC<MovieListProps> = ({
  movies,
  handlePosterClick,
  getImageUrl,
}) => {
  const { removeMovie, updateTMDBId } = useMovies();
  const { showSnackbar } = useSnackbar();
  const { openDialog, setMessage } = useConfirmation();
  const [selectedMovie, setSelectedMovie] = React.useState<VideoDataModel | null>(null);
  const [openMovieSuggestionsModal, setOpenMovieSuggestionsModal] = React.useState(false);
  const { addToConversionQueue } = useMp4Conversion();
  const { settings } = useSettings();

  const handleDelete = async (filePath: string) => {
    setMessage("Are you sure you want to delete this Movie?");
    const dialogDecision = await openDialog("Delete");
    
    if (dialogDecision !== "Ok") return;
    
    try {
      const del = await window.fileManagerAPI.deleteFile(filePath);
      if (del.success) {
        removeMovie(filePath);
        showSnackbar("Movie deleted successfully", "success");
      } else {
        showSnackbar(`Failed to delete Movie: ${del.message}`, "error");
      }
    } catch (error) {
      showSnackbar(`Error deleting Movie: ${error}`, "error");
    }
  };

  const handleConvertToMp4 = (fromPath: string) => {
    addToConversionQueue(fromPath);
  };

  const handleLinkMovieDb = (movie: VideoDataModel) => {
    setSelectedMovie(movie);
    setOpenMovieSuggestionsModal(true);
  };

  const handleCloseSuggestionsModal = () => {
    setOpenMovieSuggestionsModal(false);
    setSelectedMovie(null);
  };

  const handleSelectMovie = async (movie_details: MovieDetails) => {
    if (movie_details.id && selectedMovie?.filePath) {
      await updateTMDBId(selectedMovie.filePath, movie_details);
      showSnackbar("Movie linked to TMDB successfully", "success");
      setOpenMovieSuggestionsModal(false);
    }
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
            onLinkTheMovieDb={() => handleLinkMovieDb(movie)}
            onConvertToMp4={handleConvertToMp4}
            alwaysShowVideoType={settings?.showVideoType}
          />
        ))}
      </Box>
      
      <MovieSuggestionsModal
        id={selectedMovie?.movie_details?.id?.toString() || ""}
        open={openMovieSuggestionsModal}
        handleClose={handleCloseSuggestionsModal}
        fileName={removeVidExt(selectedMovie?.fileName) || ""}
        handleSelectMovie={handleSelectMovie}
      />
    </>
  );
};

export default MovieList;