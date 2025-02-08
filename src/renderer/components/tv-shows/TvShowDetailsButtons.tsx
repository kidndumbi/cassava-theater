import React from "react";
import { Box, Button } from "@mui/material";
import { VideoDataModel } from "../../../models/videoData.model"; // adjust path if needed
import RefreshIcon from "@mui/icons-material/Refresh";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

interface TvShowDetailsButtonsProps {
  tvShowDetails: VideoDataModel;
  onContinueClick: () => void;
  onStartFromBeginningClick: () => void;
  resumeText?: string;
  playText?: string;
  startFromBeginningText?: string;
}

const TvShowDetailsButtons: React.FC<TvShowDetailsButtonsProps> = ({
  tvShowDetails,
  onContinueClick,
  onStartFromBeginningClick,
  resumeText = "Resume",
  playText = "Play",
  startFromBeginningText = "Play from beginning",
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
    </Box>
  );
};

export default TvShowDetailsButtons;
