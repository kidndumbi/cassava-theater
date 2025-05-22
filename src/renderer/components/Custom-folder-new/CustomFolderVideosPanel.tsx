import theme from "../../theme";
import { VideoDataModel } from "../../../models/videoData.model";
import { removeVidExt } from "../../util/helperFunctions";
import { Alert, Box, Button, Snackbar, Paper } from "@mui/material";
import { useConfirmation } from "../../contexts/ConfirmationContext";
import { useDeleteFile } from "../../hooks/useDeleteFile";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CustomFolderModel } from "../../../models/custom-folder";
import { mp4ConversionActions } from "../../store/mp4Conversion/mp4Conversion.slice";
import { useAppDispatch } from "../../store";
import { MovieSuggestionsModal } from "../movies/MovieSuggestionsModal";
import { useMovies } from "../../hooks/useMovies";

import { useSaveJsonData } from "../../hooks/useSaveJsonData";
import { CustomFolderVideoCard } from "./CustomFolderVideoCard";
import { AppDelete } from "../common/AppDelete";
import { MovieDetails } from "../../../models/movie-detail.model";
import { AppModal } from "../common/AppModal";
import { PlaylistSelect } from "../playlists/PlaylistSelect";
import { useModalState } from "../../hooks/useModalState";
import { usePlaylists } from "../../hooks/usePlaylists";
import { PlaylistModel } from "../../../models/playlist.model";

// Define MenuItem interface
export interface OptionsMenuItem {
  label: string;
  action: () => void;
  sx?: object;
}

interface CustomFolderVideosPanelProps {
  videos: VideoDataModel[] | undefined;
  getImageUrl: (video: VideoDataModel) => string | undefined;
  onClick: (video: VideoDataModel) => void;
  selectedFolder: CustomFolderModel;
}

export const CustomFolderVideosPanel = ({
  videos,
  getImageUrl,
  onClick,
  selectedFolder,
}: CustomFolderVideosPanelProps) => {
  const dispatch = useAppDispatch();
  const { openDialog, setMessage } = useConfirmation();
  const queryClient = useQueryClient();
  const { getExtraMovieDetails } = useMovies();
  const [selectedMovie, setSelectedMovie] = useState<VideoDataModel | null>(
    null,
  );
  const { data: playlists, refetch } = usePlaylists();
  const [openMovieSuggestionsModal, setOpenMovieSuggestionsModal] =
    useState(false);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [selectedPlaylistVideo, setSelectedPlaylistVideo] =
    useState<VideoDataModel | null>(null);

  const {
    open: openPlaylistModal,
    openModal: openPlaylistModalOpen,
    closeModal: closePlaylistModal,
  } = useModalState(false);

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

  const handleLinkMovieDb = (movie: VideoDataModel) => {
    setSelectedMovie(movie);
    setOpenMovieSuggestionsModal(true);
  };

  const handleCloseSuggestionsModal = () => {
    setOpenMovieSuggestionsModal(false);
    setSelectedMovie(null);
  };

  const { mutate: updatePlaylist } = useMutation({
    mutationFn: (playlist: PlaylistModel) => {
      return window.playlistAPI.putPlaylist(playlist.id, playlist);
    },
    onSuccess: () => {
      refetch();
    },
  });

  const { mutateAsync: saveVideoJsonData } = useSaveJsonData(
    (data, savedData) => {
      queryClient.setQueryData(
        ["videoData", selectedFolder.folderPath, false, "customFolder"],
        (oldData: VideoDataModel[] = []) =>
          oldData.map((m) => {
            if (m.filePath === savedData.currentVideo.filePath) {
              return { ...m, ...savedData.newVideoJsonData };
            }
            return m;
          }),
      );
    },
  );

  const { mutate: deleteFile } = useDeleteFile(
    (data, filePathDeleted) => {
      showSnackbar("Deleted successfully", "success");
      queryClient.setQueryData(
        ["videoData", selectedFolder.folderPath, false, "customFolder"],
        (oldData: VideoDataModel[] = []) =>
          oldData.filter((m) => m.filePath !== filePathDeleted),
      );
    },
    (error) => {
      showSnackbar(`Error deleting: ${error?.message}`, "error");
    },
  );

  const handleConvertToMp4 = async (fromPath: string) => {
    const result = await window.mp4ConversionAPI.addToConversionQueue(fromPath);
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

  const handleSelectMovie = async (movie_details: MovieDetails) => {
    if (movie_details.id && selectedMovie?.filePath) {
      const extraMovieDetails = await getExtraMovieDetails(
        selectedMovie.filePath,
        movie_details,
      );
      await saveVideoJsonData({
        currentVideo: { filePath: selectedMovie.filePath },
        newVideoJsonData: {
          movie_details: extraMovieDetails,
        },
      });
      showSnackbar("Movie linked to TMDB successfully", "success");
      setOpenMovieSuggestionsModal(false);
    }
  };

  // Reusable delete handler
  const handleDeleteMovie = (video: VideoDataModel) => {
    if (video?.filePath) {
      setMessage(
        "Are you sure you want to delete this video? This will permanently remove the actual video file from your disk.",
      );
      openDialog("Delete").then((dialogDecision) => {
        if (dialogDecision !== "Ok") return;
        deleteFile(video.filePath);
      });
    }
  };

  const getMenuItems = (video: VideoDataModel): OptionsMenuItem[] => [
    {
      label: "Delete",
      action: () => handleDeleteMovie(video),
      sx: { color: theme.palette.error.main },
      // Optionally add sx for color, e.g. { color: theme.palette.error.main }
    },
    {
      label: "Link Movie Info",
      action: () => handleLinkMovieDb(video),
    },
    ...(video?.filePath && !video.filePath.endsWith(".mp4")
      ? [
          {
            label: "Convert to MP4",
            action: () => {
              if (video.filePath) {
                handleConvertToMp4(video.filePath);
              }
            },
          },
        ]
      : []),
    {
      label: !video.watchLater
        ? "Add to Watch Later"
        : "Remove from Watch Later",
      action: () =>
        window.videoAPI.saveVideoJsonData({
          currentVideo: { filePath: video.filePath },
          newVideoJsonData: { watchLater: !video.watchLater },
        }),
    },
    {
      label: "Playlists",
      action: () => {
        setSelectedPlaylistVideo(video);
        openPlaylistModalOpen();
      },
    },
    // Add more menu items as needed
  ];

  return (
    <>
      <Paper
        sx={{
          flex: 1,
          minHeight: 300,
          p: 2,
          backgroundColor: theme.customVariables.appDarker,
          color: theme.customVariables.appWhiteSmoke,
        }}
      >
        <Box display="flex" flexWrap="wrap" gap={2}>
          {videos?.length > 0 ? (
            videos.map((video, idx) =>
              video ? (
                <CustomFolderVideoCard
                  key={video.filePath || idx}
                  video={video}
                  idx={idx}
                  getMenuItems={getMenuItems}
                  getImageUrl={getImageUrl}
                  onClick={onClick}
                  dragging={(isDragging: boolean, dragIdx: number) => {
                    if (isDragging) {
                      setDraggingIdx(dragIdx);
                    } else {
                      setDraggingIdx((current) =>
                        current === dragIdx ? null : current,
                      );
                    }
                  }}
                />
              ) : null,
            )
          ) : (
            <div>No Videos</div>
          )}
        </Box>
      </Paper>

      {draggingIdx !== null && (
        <AppDelete
          itemDroped={(item: {
            index: number;
            type: string;
            video: VideoDataModel;
          }) => {
            handleDeleteMovie(item.video);
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
