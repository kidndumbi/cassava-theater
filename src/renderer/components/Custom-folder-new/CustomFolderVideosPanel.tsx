import theme from "../../theme";
import { VideoDataModel } from "../../../models/videoData.model";
import { removeVidExt } from "../../util/helperFunctions";
import { Alert, Box, Button, Snackbar, Paper } from "@mui/material";
import { useConfirmation } from "../../contexts/ConfirmationContext";
import { useDeleteFile } from "../../hooks/useDeleteFile";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CustomFolderModel } from "../../../models/custom-folder";
import { useAppDispatch } from "../../store";
import { MovieSuggestionsModal } from "../movies/MovieSuggestionsModal";
import { useMovies } from "../../hooks/useMovies";

import { useSaveJsonData } from "../../hooks/useSaveJsonData";
import { CustomFolderVideoCard } from "./CustomFolderVideoCard";
import { AppDrop } from "../common/AppDrop";
import { MovieDetails } from "../../../models/movie-detail.model";
import { AppModal } from "../common/AppModal";
import { PlaylistSelect } from "../playlists/PlaylistSelect";
import { useModalState } from "../../hooks/useModalState";
import { usePlaylists } from "../../hooks/usePlaylists";
import { ListDisplayType, PlaylistModel } from "../../../models/playlist.model";
import { useDragState } from "../../hooks/useDragState";
import { mp4ConversionNewActions } from "../../store/mp4ConversionNew.slice";
import { addToConversionQueue } from "../../util/mp4ConversionAPI-helpers";

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
  displayType: ListDisplayType;
}

export const CustomFolderVideosPanel = ({
  videos,
  getImageUrl,
  onClick,
  selectedFolder,
  displayType,
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
            action: async () => {
              if (video.filePath) {
                const { success, queue, message } = await addToConversionQueue(
                  video.filePath,
                );
                if (!success) {
                  showSnackbar(message, "error");
                  return;
                }
                dispatch(mp4ConversionNewActions.setConversionProgress(queue));
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
    {
      label: "Reset time",
      action: () => {
        if (video.filePath) {
          saveVideoJsonData({
            currentVideo: { filePath: video.filePath },
            newVideoJsonData: { currentTime: 0 },
          });
        }
      },
    },
  ];

  const { isAnyDragging, setDragging } = useDragState();

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
        <Box
          display="flex"
          flexWrap={displayType === "grid" ? "wrap" : "nowrap"}
          flexDirection={displayType === "list" ? "column" : "row"}
          gap={2}
        >
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
                  dragging={setDragging}
                  displayType={displayType}
                />
              ) : null,
            )
          ) : (
            <div>No Videos</div>
          )}
        </Box>
      </Paper>

      {isAnyDragging && (
        <AppDrop
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
