import React from "react";
import { Box } from "@mui/material";
import { styled } from "@mui/system";
import { VideoDataModel } from "../../../models/videoData.model";
import { trimFileName } from "../../util/helperFunctions";
import { PosterCard } from "../common/PosterCard";
import { AppMore } from "../common/AppMore";
import { useMovies } from "../../hooks/useMovies";
import { useSnackbar } from "../../contexts/SnackbarContext";

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
  top: 0,
  right: 0,
  display: "none",
});

const MovieList: React.FC<MovieListProps> = ({
  movies,
  handlePosterClick,
  getImageUrl,
}) => {
  const { removeMovie } = useMovies();
  const { showSnackbar } = useSnackbar();

  const handleDelete = async (filePath: string) => {
    try {
      const del = await window.fileManagerAPI.deleteFile(filePath);
      if (del.success) {
        removeMovie(filePath);
        showSnackbar("File deleted successfully", "success");
      } else {
        showSnackbar("Failed to delete file: " + del.message, "error");
      }
    } catch (error) {
      showSnackbar("Error deleting movie: " + error, "error");
    }
  };

  return (
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
            <AppMore handleDelete={handleDelete.bind(null, movie.filePath)} />
          </HoverContent>
        </HoverBox>
      ))}
    </Box>
  );
};

export default MovieList;
