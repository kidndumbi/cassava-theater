import React, { useEffect, useState } from "react";
import { Box, Snackbar, Alert, Button } from "@mui/material";
import { VideoDataModel } from "../../../models/videoData.model";
import { removeVidExt } from "../../util/helperFunctions";
import { useMovies } from "../../hooks/useMovies";
import { useConfirmation } from "../../contexts/ConfirmationContext";
import { MovieSuggestionsModal } from "./MovieSuggestionsModal";
import { MovieDetails } from "../../../models/movie-detail.model";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mp4ConversionActions } from "../../store/mp4Conversion/mp4Conversion.slice";
import { useAppDispatch } from "../../store";
import { useGetAllSettings } from "../../hooks/settings/useGetAllSettings";
import { useDeleteFile } from "../../hooks/useDeleteFile";
import { useSaveJsonData } from "../../hooks/useSaveJsonData";
import { usePlaylists } from "../../hooks/usePlaylists";
import { MovieListItem } from "./MovieListItem";
import { AppModal } from "../common/AppModal";
import { PlaylistSelect } from "../playlists/PlaylistSelect";
import { PlaylistModel } from "../../../models/playlist.model";
import { AppContextMenu } from "../common/AppContextMenu";
import theme from "../../theme";

interface MovieListProps {
  movies: VideoDataModel[];
  handlePosterClick: (videoPath: string) => void;
  getImageUrl: (movie: VideoDataModel) => string;
}

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
  const [openPlaylistModal, setOpenPlaylistModal] = React.useState(false);
  const [selectedPlaylistVideo, setSelectedPlaylistVideo] =
    React.useState<VideoDataModel | null>(null);
  const { data: settings } = useGetAllSettings();
  const { data: playlists, refetch } = usePlaylists();

  useEffect(() => {
    console.log("Playlists data:", playlists);
  }, [playlists]);

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

  const { mutate: updatePlaylist } = useMutation({
    mutationFn: (playlist: PlaylistModel) => {
      return window.playlistAPI.putPlaylist(playlist.id, playlist);
    },
    onSuccess: () => {
      refetch();
    },
  });

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

  // Helper to build context menu items for AppContextMenu
  const getMenuItems = (movie: VideoDataModel) => [
    {
      label: "Delete",
      action: () => {
        if (movie?.filePath) {
          setMessage("Are you sure you want to delete this Movie?");
          openDialog("Delete").then((dialogDecision) => {
            if (dialogDecision !== "Ok") return;
            deleteFile(movie.filePath);
          });
        }
      },
      sx: { color: theme.palette.error.main },
    },
    {
      label: "Link Movie Info",
      action: () => handleLinkMovieDb(movie),
    },
    ...(movie?.filePath && !movie.filePath.endsWith(".mp4")
      ? [
          {
            label: "Convert to MP4",
            action: () => {
              if (movie.filePath) {
                handleConvertToMp4(movie.filePath);
              } else {
                console.error("File path is undefined.");
              }
            },
          },
        ]
      : []),
    {
      label: !movie.watchLater ? "Add to Watch Later" : "Remove from Watch Later",
      action: () =>
        window.videoAPI.saveVideoJsonData({
          currentVideo: { filePath: movie.filePath },
          newVideoJsonData: { watchLater: !movie.watchLater },
        }),
    },
    {
      label: "Playlists",
      action: () => {
        setSelectedPlaylistVideo(movie);
        setOpenPlaylistModal(true);
      },
    },
    // Add more menu items as needed
  ];

  return (
    <>
      <Box display="flex" flexWrap="wrap" gap="4px">
        {movies?.map((movie) => (
          <AppContextMenu
            key={movie.filePath}
            title={removeVidExt(movie.fileName ?? "")}
            menuItems={getMenuItems(movie)}
          >
            <div>
              <MovieListItem
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
                handlePlaylistUpdate={async (movie) => {
                  setSelectedPlaylistVideo(movie);
                  setOpenPlaylistModal(true);
                }}
              />
            </div>
          </AppContextMenu>
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

      <AppModal
        open={openPlaylistModal}
        onClose={() => {
          setOpenPlaylistModal(false);
          setSelectedPlaylistVideo(null); 
        }}
        title="Playlists"
        fullScreen={false}
      >
        <PlaylistSelect
          playlists={playlists}
          video={selectedPlaylistVideo}
          updatePlaylist={(playlist) => {
            updatePlaylist(playlist);
          }}
        ></PlaylistSelect>
      </AppModal>
    </>
  );
};

export default React.memo(MovieList);
