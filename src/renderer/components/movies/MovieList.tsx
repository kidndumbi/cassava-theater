import React, { useState } from "react";
import { Box, Snackbar, Alert, Button } from "@mui/material";
import { VideoDataModel } from "../../../models/videoData.model";
import { removeVidExt } from "../../util/helperFunctions";
import { useMovies } from "../../hooks/useMovies";
import { useConfirmation } from "../../contexts/ConfirmationContext";
import { MovieSuggestionsModal } from "./MovieSuggestionsModal";
import { MovieDetails } from "../../../models/movie-detail.model";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAppSelector, useAppDispatch } from "../../store";
import {
  setScrollPoint,
  selectScrollPoint,
} from "../../store/scrollPoint.slice";
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
import { useModalState } from "../../hooks/useModalState";
import { AppDrop } from "../common/AppDrop";
import { useDragState } from "../../hooks/useDragState";
import { mp4ConversionNewActions } from "../../store/mp4ConversionNew.slice";

interface MovieListProps {
  movies: VideoDataModel[];
  handlePosterClick: (videoPath: string) => void;
  getImageUrl: (movie: VideoDataModel) => string;
}

const SCROLL_KEY = "MovieListScroll";

const MovieList: React.FC<MovieListProps> = ({
  movies,
  handlePosterClick,
  getImageUrl,
}) => {
  const dispatch = useAppDispatch();
  const scrollPoint = useAppSelector((state) =>
    selectScrollPoint(state, SCROLL_KEY),
  );
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const { getExtraMovieDetails } = useMovies();
  const { openDialog } = useConfirmation();
  const [selectedMovie, setSelectedMovie] =
    React.useState<VideoDataModel | null>(null);
  const [openMovieSuggestionsModal, setOpenMovieSuggestionsModal] =
    React.useState(false);
  const [selectedPlaylistVideo, setSelectedPlaylistVideo] =
    React.useState<VideoDataModel | null>(null);
  const {
    open: openPlaylistModal,
    openModal: openPlaylistModalOpen,
    closeModal: closePlaylistModal,
  } = useModalState(false);
  const { data: settings } = useGetAllSettings();
  const { data: playlists, refetch } = usePlaylists();

  const queryClient = useQueryClient();
  const { isAnyDragging, setDragging } = useDragState();

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
      showSnackbar("Success", "success");
    },
    (error) => {
      showSnackbar(`Error updating: ${error?.message}`, "error");
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

  const handleConvertToMp4 = async (fromPath: string) => {
    const { queue } =
      await window.mp4ConversionAPI.addToConversionQueue(fromPath);
    dispatch(
      mp4ConversionNewActions.setConversionProgress(
        queue.filter((q) => q.status !== "failed"),
      ),
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

  const handleSelectMovie = async (
    movie_details: MovieDetails,
    selectedMovie: VideoDataModel,
  ) => {
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

  // Move delete handler outside getMenuItems
  const handleDeleteMovie = async (movie: VideoDataModel) => {
    if (movie?.filePath) {
      if (
        (await openDialog(
          "Delete",
          null,
          "Are you sure you want to delete this Movie?",
        )) !== "Ok"
      )
        return;
      deleteFile(movie.filePath);
    }
  };

  const getMenuItems = (movie: VideoDataModel) => {
    const menuItems = [
      {
        label: "Delete",
        action: () => handleDeleteMovie(movie),
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
        label: !movie.watchLater
          ? "Add to Watch Later"
          : "Remove from Watch Later",
        action: () =>
          saveVideoJsonData({
            currentVideo: { filePath: movie.filePath },
            newVideoJsonData: { watchLater: !movie.watchLater },
          }),
      },
      {
        label: "Playlists",
        action: () => {
          setSelectedPlaylistVideo(movie);
          openPlaylistModalOpen();
        },
      },
      {
        label: "Reset time",
        action: () => {
          if (movie.filePath) {
            saveVideoJsonData({
              currentVideo: { filePath: movie.filePath },
              newVideoJsonData: { currentTime: 0 },
            });
          }
        },
      },

      // Add more menu items as needed
    ];

    if (movie.movie_details) {
      menuItems.push({
        label: "Clear Movie Info",
        action: () => {
          if (movie.filePath) {
            saveVideoJsonData({
              currentVideo: { filePath: movie.filePath },
              newVideoJsonData: { movie_details: null },
            });
          }
        },
      });

      menuItems.push({
        label: "Refresh Movie Info",
        action: () => {
          handleSelectMovie(movie.movie_details, movie);
        },
      });
    }

    return menuItems;
  };

  React.useEffect(() => {
    if (scrollContainerRef.current && typeof scrollPoint === "number") {
      scrollContainerRef.current.scrollTop = scrollPoint;
    }
  }, [scrollPoint]);

  React.useEffect(() => {
    const ref = scrollContainerRef.current;
    if (!ref) return;
    const handleScroll = () => {
      const value = ref.scrollTop;
      dispatch(setScrollPoint({ key: SCROLL_KEY, value }));
    };
    ref.addEventListener("scroll", handleScroll);
    return () => {
      ref.removeEventListener("scroll", handleScroll);
    };
  }, [dispatch]);

  return (
    <>
      <Box
        display="flex"
        flexWrap="wrap"
        gap="4px"
        ref={scrollContainerRef}
        sx={{ overflowY: "auto", maxHeight: "calc(100vh - 100px)" }}
      >
        {movies?.map((movie, index) => (
          <AppContextMenu
            key={movie.filePath}
            title={removeVidExt(movie.fileName ?? "")}
            menuItems={getMenuItems(movie)}
          >
            <div>
              <MovieListItem
                idx={index}
                movie={movie}
                onPosterClick={handlePosterClick}
                getImageUrl={getImageUrl}
                alwaysShowVideoType={settings?.showVideoType}
                dragging={setDragging}
              />
            </div>
          </AppContextMenu>
        ))}
      </Box>

      {isAnyDragging && (
        <AppDrop
          itemDroped={(item: {
            index: number;
            type: string;
            movie: VideoDataModel;
          }) => {
            handleDeleteMovie(item.movie);
          }}
          accept={["VIDEO"]}
        />
      )}

      <MovieSuggestionsModal
        id={selectedMovie?.movie_details?.id?.toString() || ""}
        open={openMovieSuggestionsModal}
        handleClose={handleCloseSuggestionsModal}
        fileName={removeVidExt(selectedMovie?.fileName) || ""}
        filePath={selectedMovie?.filePath || ""}
        handleSelectMovie={(movie_details: MovieDetails) =>
          handleSelectMovie(movie_details, selectedMovie)
        }
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
          closePlaylistModal();
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
