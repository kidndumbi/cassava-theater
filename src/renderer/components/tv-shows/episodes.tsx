import React from "react";
import { Box, Theme } from "@mui/material";
import { VideoDataModel } from "../../../models/videoData.model";
import { Episode } from "./episode";
import LoadingIndicator from "../common/LoadingIndicator";
import { formatDate } from "../../util/helperFunctions";
import { useMp4Conversion } from "../../hooks/useMp4Conversion";
import { useDeleteFile } from "../../hooks/useDeleteFile";
import { useSnackbar } from "../../contexts/SnackbarContext";

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

  const { showSnackbar } = useSnackbar();

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
            onEpisodeClick={onEpisodeClick}
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
