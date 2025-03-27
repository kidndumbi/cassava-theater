import { IconButton } from "@mui/material";
import React from "react";
import theme from "../../../theme";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import AppIconButton from "../../common/AppIconButton";

export const PlayPauseControls: React.FC<{
  onPlayPause: (isPlaying: boolean) => void;
  paused: boolean;
}> = ({ paused, onPlayPause }) => (
  <AppIconButton tooltip="" onClick={() => onPlayPause(!paused)}>
    {!paused ? (
      <PauseIcon sx={{ fontSize: 40 }} />
    ) : (
      <PlayArrowIcon sx={{ fontSize: 40 }} />
    )}
  </AppIconButton>
);
