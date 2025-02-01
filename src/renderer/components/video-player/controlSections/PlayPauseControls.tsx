import {IconButton } from "@mui/material";
import React from "react";
import theme from "../../../theme";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";

export const PlayPauseControls: React.FC<{
  onPlayPause: (isPlaying: boolean) => void;
  paused: boolean;
}> = ({ paused, onPlayPause }) => (
  <IconButton
    aria-label="toggle playback"
    onClick={() => onPlayPause(!paused)}
    sx={{
      color: theme.customVariables.appWhite,
      width: 48,
      height: 48,
    }}
  >
    {!paused ? (
      <PauseIcon sx={{ fontSize: 40 }} />
    ) : (
      <PlayArrowIcon sx={{ fontSize: 40 }} />
    )}
  </IconButton>
);
