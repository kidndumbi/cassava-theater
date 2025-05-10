import { Alert, Box, Button, Snackbar, Typography } from "@mui/material";
import React, { useState } from "react";
import { VideoDataModel } from "../../../models/videoData.model";
import { getUrl, hasExtension, removeVidExt } from "../../util/helperFunctions";
import FolderIcon from "@mui/icons-material/Folder";
import { PosterCard } from "../common/PosterCard";
import { useGetAllSettings } from "../../hooks/settings/useGetAllSettings";
import { HoverBox } from "../common/HoverBox";
import { HoverContent } from "../common/HoverContent";
import { VideoTypeContainer } from "../common/VideoTypeContainer";
import { VideoTypeChip } from "../common/VideoTypeChip";
import { useAppDispatch } from "../../store";
import { useMovies } from "../../hooks/useMovies";
import { useConfirmation } from "../../contexts/ConfirmationContext";
import { MovieDetails } from "../../../models/movie-detail.model";
import { useQueryClient } from "@tanstack/react-query";
import { mp4ConversionActions } from "../../store/mp4Conversion/mp4Conversion.slice";
import { useDeleteFile } from "../../hooks/useDeleteFile";
import { MovieSuggestionsModal } from "../movies/MovieSuggestionsModal";
import { CustomFolderModel } from "../../../models/custom-folder";
import { useSaveJsonData } from "../../hooks/useSaveJsonData";
import { AppMore } from "../common/AppMore";

const CustomFolderItem: React.FC<{
  video: VideoDataModel;
  getImageUlr: (movie: VideoDataModel) => string | undefined;
  handlePosterClick: (videoPath: string) => void;
  alwaysShowVideoType: boolean;
}> = ({
  video,
  getImageUlr,
  handlePosterClick,
  alwaysShowVideoType,
}) => {
  const renderFolderIcon = (item: VideoDataModel) =>
    item.fileName &&
    !hasExtension(item.fileName) && (
      <Box className="absolute left-1 top-1">
        <FolderIcon color="secondary" />
      </Box>
    );

  return (
    <HoverBox>
      <PosterCard
        imageUrl={getImageUlr(video)}
        altText={video.fileName}
        onClick={() => video.filePath && handlePosterClick(video.filePath)}
        footer={renderFolderIcon(video)}
      />
      <HoverContent className="hover-content" />
      {hasExtension(video.fileName) && (
        <VideoTypeContainer
          className={!alwaysShowVideoType ? "hover-content" : ""}
          alwaysShow={alwaysShowVideoType}
        >
          <VideoTypeChip filePath={video.filePath} />
        </VideoTypeContainer>
      )}
    </HoverBox>
  );
};

interface CustomFolderDataListProps {
  customFolderData: VideoDataModel[];
  customFolder: CustomFolderModel;
  handlePosterClick: (videoPath: string) => void;
  getImageUrl: (path: string) => string;
}

const CustomFolderDataList: React.FC<CustomFolderDataListProps> = ({
  handlePosterClick,
  getImageUrl,
  customFolderData,
  customFolder,
}) => {
  const { data: settings } = useGetAllSettings();
  const dispatch = useAppDispatch();
  const { getExtraMovieDetails } = useMovies();
  const { openDialog, setMessage } = useConfirmation();
  const [selectedMovie, setSelectedMovie] =
    React.useState<VideoDataModel | null>(null);
  const [openMovieSuggestionsModal, setOpenMovieSuggestionsModal] =
    React.useState(false);

  const queryClient = useQueryClient();

  const { mutateAsync: saveVideoJsonData } = useSaveJsonData(
    (data, savedData) => {
      queryClient.setQueryData(
        ["videoData", customFolder.folderPath, false, "customFolder"],
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

  const getImageUlr = (movie: VideoDataModel) => {
    if (movie.poster?.trim()) {
      return getUrl("file", movie.poster, null, settings?.port);
    }
    if (movie?.movie_details?.poster_path) {
      return getImageUrl(movie.movie_details.poster_path);
    }
  };

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

  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    video: VideoDataModel | null;
  } | null>(null);

  return (
    <>
      <Box className="flex flex-wrap gap-1">
        {customFolderData?.map((video, idx) => (
          <div
            key={idx}
            onContextMenu={(e) => {
              e.preventDefault();
              setContextMenu({
                mouseX: e.clientX + 2,
                mouseY: e.clientY - 6,
                video,
              });
            }}
          >
            <Box className="m-1 max-w-[200px] flex-[1_1_200px]">
              <Box className="relative">
                <CustomFolderItem
                  video={video}
                  getImageUlr={getImageUlr}
                  handlePosterClick={handlePosterClick}
                  alwaysShowVideoType={settings?.showVideoType}
                />
              </Box>
              <Typography
                variant="subtitle1"
                align="center"
                className="break-all"
              >
                {removeVidExt(video.fileName ?? "")}
              </Typography>
            </Box>
          </div>
        ))}
      </Box>
      <AppMore
        open={!!contextMenu}
        anchorPosition={
          contextMenu
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : null
        }
        onClose={() => setContextMenu(null)}
        isMovie={true}
        handleDelete={() => {
          if (contextMenu?.video?.filePath) {
            setMessage("Are you sure you want to delete this Movie?");
            openDialog("Delete").then((dialogDecision) => {
              if (dialogDecision !== "Ok") return;
              deleteFile(contextMenu.video.filePath);
            });
          }
        }}
        linkTheMovieDb={() => {
          if (contextMenu?.video) handleLinkMovieDb(contextMenu.video);
        }}
        isNotMp4={!contextMenu?.video?.filePath?.endsWith(".mp4")}
        handleConvertToMp4={() => {
          if (contextMenu?.video?.filePath) handleConvertToMp4(contextMenu.video.filePath);
        }}
        videoData={contextMenu?.video || {}}
        handleWatchLaterUpdate={async (filePath, watchLater) => {
          await window.videoAPI.saveVideoJsonData({
            currentVideo: { filePath },
            newVideoJsonData: { watchLater },
          });
        }}
      />
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

export { CustomFolderDataList };
