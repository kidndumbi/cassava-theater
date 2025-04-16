import React from "react";
import { Box, Theme } from "@mui/material";
import { VideoDataModel } from "../../../models/videoData.model";
import { Episode } from "./episode";
import LoadingIndicator from "../common/LoadingIndicator";
import { formatDate } from "../../util/helperFunctions";
import { useMp4Conversion } from "../../hooks/useMp4Conversion";

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
}) => {
  const { convertToMp4 } = useMp4Conversion();

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
      {episodes.length === 0 ? (
        <p>No episodes available.</p>
      ) : (
        episodes.map((episode) => (
          <Episode
            key={episode.filePath}
            episode={episode}
            theme={theme}
            onEpisodeClick={onEpisodeClick}
            handleFilepathChange={handleFilepathChange}
            handleConvertToMp4={(filePath) => {
              convertToMp4([filePath]);
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
