import React from "react";
import { Alert, Box, Theme } from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";

import { VideoDataModel } from "../../../models/videoData.model";
import { Episode } from "./episode";
import LoadingIndicator from "../common/LoadingIndicator";
import { formatDate } from "../../util/helperFunctions";
import { useMp4Conversion } from "../../hooks/useMp4Conversion";
import { useDeleteFile } from "../../hooks/useDeleteFile";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { useGetAllSettings } from "../../hooks/settings/useGetAllSettings";
import { useConfirmation } from "../../contexts/ConfirmationContext";

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
  const { addToConversionQueue } = useMp4Conversion();
  const { data: settings } = useGetAllSettings();

  const { showSnackbar } = useSnackbar();
  const { openDialog, setMessage } = useConfirmation();

  const deleteFileMutation = useDeleteFile((result, filePath) => {
    showSnackbar("File deleted successfully", "success");
    episodeDeleted(filePath);
  });

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
            onEpisodeClick={async () => {
              if (
                !settings?.playNonMp4Videos &&
                !episode.filePath?.toLowerCase().endsWith(".mp4")
              ) {
                const converSionQueue =
                  await window.mp4ConversionAPI.getConversionQueue();
                const queued = converSionQueue.find(
                  (q) =>
                    q.inputPath === episode.filePath && q.status !== "failed",
                );
                const message = !queued
                  ? `This video is not in MP4 format and cannot be played
                    directly. Please click OK to convert it to MP4 format.`
                  : `This video is not in MP4 format and cannot be played
                    directly. This video is already in the conversion queue. Please wait for it to finish converting.`;

                setMessage(
                  <Alert
                    icon={<WarningIcon fontSize="inherit" />}
                    severity="warning"
                  >
                    {message}
                  </Alert>,
                );
                const dialogDecision = await openDialog(
                  undefined,
                  queued ? true : false,
                );
                if (dialogDecision === "Ok") {
                  addToConversionQueue(episode.filePath);
                }
                return;
              }
              onEpisodeClick(episode);
            }}
            handleFilepathChange={handleFilepathChange}
            handleConvertToMp4={(filePath) => {
              addToConversionQueue(filePath);
            }}
            handleDelete={async (filePath) => {
              await deleteFileMutation.mutateAsync(filePath);
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
    </>
  );
};
