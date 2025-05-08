import React, { useState } from "react";
import { Box, Snackbar, Alert, Button } from "@mui/material";
import { VideoDataModel } from "../../../models/videoData.model";
import { removeVidExt, trimFileName } from "../../util/helperFunctions";
import { PosterCard } from "../common/PosterCard";
import { AppMore } from "../common/AppMore";
import { useMovies } from "../../hooks/useMovies";
import { useConfirmation } from "../../contexts/ConfirmationContext";
import { MovieSuggestionsModal } from "./MovieSuggestionsModal";
import { VideoTypeChip } from "../common/VideoTypeChip";
import { MovieDetails } from "../../../models/movie-detail.model";
import { useQueryClient } from "@tanstack/react-query";
import { mp4ConversionActions } from "../../store/mp4Conversion/mp4Conversion.slice";
import { useAppDispatch } from "../../store";
import { useGetAllSettings } from "../../hooks/settings/useGetAllSettings";
import { useDeleteFile } from "../../hooks/useDeleteFile";
import { HoverBox } from "../common/HoverBox";
import { HoverContent } from "../common/HoverContent";
import { VideoTypeContainer } from "../common/VideoTypeContainer";
import { useSaveJsonData } from "../../hooks/useSaveJsonData";

interface MovieListProps {
  movies: VideoDataModel[];
  handlePosterClick: (videoPath: string) => void;
  getImageUrl: (movie: VideoDataModel) => string;
}

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
          videoData={movie}
          handleWatchLaterUpdate={async (filePath, watchLater) => {
            await window.videoAPI.saveVideoJsonData({
              currentVideo: { filePath },
              newVideoJsonData: { watchLater },
            });
          }}
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
  const dispatch = useAppDispatch();
  const { getExtraMovieDetails } = useMovies();
  const { openDialog, setMessage } = useConfirmation();
  const [selectedMovie, setSelectedMovie] =
    React.useState<VideoDataModel | null>(null);
  const [openMovieSuggestionsModal, setOpenMovieSuggestionsModal] =
    React.useState(false);
  const { data: settings } = useGetAllSettings();

  const queryClient = useQueryClient();

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
    actionText?: string;
    onAction?: () => void;
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = (
    message: string,
    severity: "success" | "error",
    actionText?: string,
    onAction?: () => void,
  ) => {
    setSnackbar({ open: true, message, severity, actionText, onAction });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const { mutateAsync: saveVideoJsonData } = useSaveJsonData(
    (data, variables) => {
      queryClient.setQueryData(
        ["videoData", settings?.movieFolderPath, false, "movies"],
        (oldData: VideoDataModel[] = []) =>
          oldData.map((m) => {
            if (m.filePath === variables.currentVideo.filePath) {
              return { ...m, ...variables.newVideoJsonData };
            }
            return m;
          }),
      );
      showSnackbar("Custom image updated successfully", "success");
    },
    (error) => {
      showSnackbar(`Error updating custom image: ${error?.message}`, "error");
    },
  );

  const { mutate: deleteFile } = useDeleteFile(
    (data, filePathDeleted) => {
      showSnackbar("Movie deleted successfully", "success");
      queryClient.setQueryData(
        ["videoData", settings?.movieFolderPath, false, "movies"],
        (oldData: VideoDataModel[] = []) =>
          oldData.filter((m) => m.filePath !== filePathDeleted),
      );
    },
    (error) => {
      showSnackbar(`Error deleting Movie: ${error?.message}`, "error");
    },
  );

  const handleConvertToMp4 = (fromPath: string) => {
    const result = window.mp4ConversionAPI.addToConversionQueue(fromPath);
    if (!result) {
      console.error(`Failed to add ${fromPath} to conversion queue.`);
      return;
    }
    dispatch(
      mp4ConversionActions.updateConvertToMp4Progress({
        fromPath,
        toPath: fromPath.replace(/\.[^/.]+$/, ".mp4"),
        percent: 0,
        paused: false,
        complete: false,
      }),
    );
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
      const extraMovieDetails = await getExtraMovieDetails(
        selectedMovie.filePath,
        movie_details,
      );
      saveVideoJsonData({
        currentVideo: { filePath: selectedMovie.filePath },
        newVideoJsonData: { movie_details: extraMovieDetails },
      });

      showSnackbar("Movie linked to TMDB successfully", "success");
      setOpenMovieSuggestionsModal(false);
    }
  };

  return (
    <>
      <Box display="flex" flexWrap="wrap" gap="4px">
        {movies?.map((movie) => (
          <MovieListItem
            key={movie.filePath}
            movie={movie}
            onPosterClick={handlePosterClick}
            getImageUrl={getImageUrl}
            onDelete={async (filePath) => {
              setMessage("Are you sure you want to delete this Movie?");
              const dialogDecision = await openDialog("Delete");

              if (dialogDecision !== "Ok") return;
              deleteFile(filePath);
            }}
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
        filePath={selectedMovie?.filePath || ""}
        handleSelectMovie={handleSelectMovie}
        handleImageUpdate={(data: VideoDataModel, filePath: string) => {
          if (!filePath) return;
          saveVideoJsonData({
            currentVideo: { filePath },
            newVideoJsonData: data,
          });
        }}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          action={
            snackbar.actionText ? (
              <Button
                color="inherit"
                size="small"
                onClick={() => {
                  if (snackbar.onAction) snackbar.onAction();
                  handleCloseSnackbar();
                }}
              >
                {snackbar.actionText}
              </Button>
            ) : null
          }
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default React.memo(MovieList);
