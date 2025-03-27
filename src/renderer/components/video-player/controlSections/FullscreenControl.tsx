import { Box, IconButton } from "@mui/material";
import React from "react";
import theme from "../../../theme";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import AppIconButton from "../../common/AppIconButton";

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
    <Box className="ml-2 mr-2">
      <AppIconButton
        aria-label="Full screen"
        tooltip=""
        onClick={onToggleFullscreen}
      >
        <Icon sx={{ fontSize: 40 }} />
      </AppIconButton>
    </Box>
  );
};
