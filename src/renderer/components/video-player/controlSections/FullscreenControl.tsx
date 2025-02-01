import { IconButton } from "@mui/material";
import React from "react";
import theme from "../../../theme";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";

interface FullscreenControlProps {
  onToggleFullscreen: () => void;
  isFullScreen: boolean;
}

export const FullscreenControl: React.FC<FullscreenControlProps> = ({
  onToggleFullscreen,
  isFullScreen,
}) => {
  const Icon = isFullScreen ? FullscreenExitIcon : FullscreenIcon;
  return (
    <IconButton
      aria-label="Full screen"
      onClick={onToggleFullscreen}
      sx={{
        color: theme.customVariables.appWhite,
        width: 48,
        height: 48,
      }}
    >
      <Icon sx={{ fontSize: 40 }} />
    </IconButton>
  );
};
