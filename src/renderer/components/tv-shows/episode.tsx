import React, { useState } from "react";
import { Box, IconButton, Theme, Tooltip } from "@mui/material";

import {
  getPlayedPercentage,
  secondsTohhmmss,
} from "../../util/helperFunctions";
import { VideoDataModel } from "../../../models/videoData.model";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ClosedCaptionButton from "../common/ClosedCaptionButton";
import NotesIcon from "@mui/icons-material/Notes";
import "./episode.css";
import { VideoProgressBar } from "../common/VideoProgressBar";
import { NotesModal } from "../common/NotesModal";

interface EpisodeProps {
  episode: VideoDataModel;
  theme: Theme;
  onEpisodeClick: (episode: VideoDataModel) => void;
  handleFilepathChange: (
    newSubtitleFilePath: string,
    episode: VideoDataModel
  ) => void;
}

export const Episode: React.FC<EpisodeProps> = ({
  episode,
  theme,
  onEpisodeClick,
  handleFilepathChange,
}) => {
  const [hover, setHover] = useState(false);
  const [openNotesModal, setOpenNotesModal] = useState(false);
  const handleCloseNotesModal = () => setOpenNotesModal(false);

  const handleMouseEnter = () => setHover(true);
  const handleMouseLeave = () => setHover(false);
  const handlePlayClick = () => onEpisodeClick(episode);
  const handleNotesClick = () => setOpenNotesModal(true);

  return (
    <Box key={episode.filePath} className="episode-container">
      <Box
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="episode-thumbnail-container"
      >
        <img
          src={episode.videoProgressScreenshot}
          alt="Progress"
          className="episode-thumbnail"
          onClick={handlePlayClick}
        />
        {hover && (
          <PlayArrowIcon className="play-icon" onClick={handlePlayClick} />
        )}
        {episode.currentTime !== undefined && episode.currentTime > 0 && (
          <Box className="progress-bar-container">
            <VideoProgressBar
              current={episode.currentTime}
              total={episode.duration || 0}
            />
            <Box className="progress-percentage">
              {getPlayedPercentage(episode.currentTime, episode.duration || 0)}%
            </Box>
          </Box>
        )}
      </Box>

      <Box
        className="episode-details"
        sx={{ color: theme.customVariables.appWhiteSmoke }}
      >
        <h3 className="episode-title">
          {episode.fileName?.replace(/\.(mp4|mkv|avi)$/i, "") || "Unknown Title"}
        </h3>
        <p className="episode-duration">
          {secondsTohhmmss(episode.duration || 0)}
        </p>
        <ClosedCaptionButton
          handleFilepathChange={(newSubtitleFilePath: string) => {
            handleFilepathChange(newSubtitleFilePath, episode);
          }}
          subtitlePath={episode.subtitlePath || "None"}
          showTooltip={true}
        />
        <Tooltip title="Notes">
          <IconButton
            className="notes-button"
            sx={{ color: theme.customVariables.appWhiteSmoke }}
            onClick={handleNotesClick}
          >
            <NotesIcon />
          </IconButton>
        </Tooltip>
      </Box>
      <NotesModal
        handleVideoSeek={(seekTime) => {
          const episodeWithUpdatedTime = { ...episode, currentTime: seekTime };
          onEpisodeClick(episodeWithUpdatedTime);
        }}
        open={openNotesModal}
        handleClose={handleCloseNotesModal}
        videoData={episode}
        currentVideoTime={0}
      />
    </Box>
  );
};
