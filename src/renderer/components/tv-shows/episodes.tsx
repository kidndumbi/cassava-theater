import React from "react";
import { Alert, Box, Theme } from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";
import { VideoDataModel } from "../../../models/videoData.model";
import { Episode } from "./episode";
import LoadingIndicator from "../common/LoadingIndicator";
import { formatDate } from "../../util/helperFunctions";
import { useDeleteFile } from "../../hooks/useDeleteFile";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { useGetAllSettings } from "../../hooks/settings/useGetAllSettings";
import { useConfirmation } from "../../contexts/ConfirmationContext";
import {
  addToConversionQueue,
  isInMp4ConversionQueue,
} from "../../util/mp4ConversionAPI-helpers";
import { AppModal } from "../common/AppModal";
import { PlaylistSelect } from "../playlists/PlaylistSelect";
import { useModalState } from "../../hooks/useModalState";
import { usePlaylists } from "../../hooks/usePlaylists";
import { PlaylistModel } from "../../../models/playlist.model";
import { useMutation } from "@tanstack/react-query";
import { mp4ConversionNewActions } from "../../store/mp4ConversionNew.slice";
import { useAppDispatch } from "../../store";

interface EpisodesProps {
  loadingEpisodes: boolean;
  episodes: VideoDataModel[];
  theme: Theme;
  onEpisodeClick: (episode: VideoDataModel) => void;
  seasonPosterPath: string;
  overview: string;
  seasonAirDate: string;
  handleFilepathChange: (
    newSubtitleFilePath: string,
    episode: VideoDataModel,
  ) => void;
  episodeDeleted: (filePath: string) => void;
}

export const Episodes: React.FC<EpisodesProps> = ({
  loadingEpisodes,
  episodes,
  theme,
  onEpisodeClick,
  seasonPosterPath,
  overview,
  seasonAirDate,
  handleFilepathChange,
  episodeDeleted,
}) => {
  const dispatch = useAppDispatch();
  const { data: settings } = useGetAllSettings();
  const { data: playlists, refetch } = usePlaylists();
  const [selectedPlaylistVideo, setSelectedPlaylistVideo] =
    React.useState<VideoDataModel | null>(null);

  const { showSnackbar } = useSnackbar();
  const { openDialog, setMessage } = useConfirmation();

  const {
    open: openPlaylistModal,
    openModal: openPlaylistModalOpen,
    closeModal: closePlaylistModal,
  } = useModalState(false);

  const deleteFileMutation = useDeleteFile((result, filePath) => {
    showSnackbar("File deleted successfully", "success");
    episodeDeleted(filePath);
  });

  const { mutate: updatePlaylist } = useMutation({
    mutationFn: (playlist: PlaylistModel) => {
      return window.playlistAPI.putPlaylist(playlist.id, playlist);
    },
    onSuccess: () => {
      refetch();
    },
  });

  // Refactored handler for episode click
  const handleEpisodeClick = async (episode: VideoDataModel) => {
    if (
      !settings?.playNonMp4Videos &&
      !episode.filePath?.toLowerCase().endsWith(".mp4")
    ) {
      const queued = await isInMp4ConversionQueue(episode.filePath);
      const baseMsg =
        "This video is not in MP4 format and cannot be played directly.";
      const message = !queued
        ? `${baseMsg} First convert to MP4 format.`
        : `${baseMsg} This video is already in the conversion queue. Please wait for it to finish converting.`;

      setMessage(
        <Alert icon={<WarningIcon fontSize="inherit" />} severity="warning">
          {message}
        </Alert>,
      );
      const dialogDecision = await openDialog(
        "Convert to MP4",
        queued ? true : false,
      );
      if (dialogDecision === "Ok") {
        const { queue, success } = await addToConversionQueue(episode.filePath);
        if (!success) {
          dispatch(
            mp4ConversionNewActions.setConversionProgress(
              queue.filter((q) => q.status !== "failed"),
            ),
          );
        }
      }
      return;
    }
    onEpisodeClick(episode);
  };

  const renderEpisodes = () => (
    <Box
      sx={{
        color: theme.customVariables.appWhiteSmoke,
        paddingLeft: 4,
        paddingTop: 4,
        paddingBottom: 4,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        backgroundSize: "cover",
        backgroundImage: `linear-gradient(to right, ${theme.customVariables.appDarker}, rgba(0, 0, 0, 0.6) 60%, rgba(0, 0, 0, 0)), linear-gradient(to top, ${theme.customVariables.appDarker}, rgba(0, 0, 0, 0.6) 60%, rgba(0, 0, 0, 0)), url(${seasonPosterPath})`,
      }}
    >
      {overview && (
        <p style={{ maxWidth: "80%" }}>
          {overview} ({formatDate(seasonAirDate)})
        </p>
      )}
      {episodes?.length === 0 ? (
        <p>No episodes available.</p>
      ) : (
        episodes?.map((episode) => (
          <Episode
            key={episode.filePath}
            episode={episode}
            theme={theme}
            onEpisodeClick={() => handleEpisodeClick(episode)}
            handleFilepathChange={handleFilepathChange}
            handleConvertToMp4Result={(success, message, queue) => {
              if (success) {
                dispatch(
                  mp4ConversionNewActions.setConversionProgress(
                    queue.filter((q) => q.status !== "failed"),
                  ),
                );
              } else {
                showSnackbar(message, "error");
              }
            }}
            handleDelete={async (filePath) => {
              await deleteFileMutation.mutateAsync(filePath);
            }}
            onPlaylistSelect={(video) => {
              setSelectedPlaylistVideo(video);
              openPlaylistModalOpen();
            }}
          />
        ))
      )}
    </Box>
  );

  return (
    <>
      {loadingEpisodes ? (
        <LoadingIndicator
          showCircularProgress={false}
          message="Loading Episodes..."
        />
      ) : (
        renderEpisodes()
      )}

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
