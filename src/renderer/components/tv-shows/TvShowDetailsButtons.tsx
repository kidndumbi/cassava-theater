import React from "react";
import { Box, Button, Tooltip } from "@mui/material";
import { VideoDataModel } from "../../../models/videoData.model"; // adjust path if needed
import RefreshIcon from "@mui/icons-material/Refresh";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { removeVidExt } from "../../util/helperFunctions";

interface TvShowDetailsButtonsProps {
  tvShowDetails: VideoDataModel;
  onContinueClick: () => void;
  onStartFromBeginningClick: () => void;
  onNextEpisodeClick?: () => void;
  resumeText?: string;
  playText?: string;
  startFromBeginningText?: string;
  nextEpisode?: VideoDataModel;
}

const TvShowDetailsButtons: React.FC<TvShowDetailsButtonsProps> = ({
  tvShowDetails,
  onContinueClick,
  onStartFromBeginningClick,
  onNextEpisodeClick,
  resumeText = "Resume",
  playText = "Play",
  startFromBeginningText = "Play from beginning",
  nextEpisode,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        gap: "10px",
        marginTop: "10px",
        marginBottom: "20px",
      }}
    >
      <Button variant="contained" color="secondary" onClick={onContinueClick}>
        <PlayArrowIcon></PlayArrowIcon>
        {(tvShowDetails?.lastVideoPlayedTime || 0) > 0 ? resumeText : playText}
      </Button>

      {(tvShowDetails?.lastVideoPlayedTime || 0) > 0 && (
        <Button
          variant="contained"
          color="primary"
          onClick={onStartFromBeginningClick}
        >
          <RefreshIcon></RefreshIcon>
          {startFromBeginningText}
        </Button>
      )}
      {onNextEpisodeClick && (
        <Tooltip title={removeVidExt(nextEpisode.fileName)}>
          <Button
            variant="contained"
            color="primary"
            onClick={onNextEpisodeClick}
          >
            Next Episode
          </Button>
        </Tooltip>
      )}
    </Box>
  );
};

export default TvShowDetailsButtons;
