import { Box } from "@mui/material";
import React, { ElementType, JSX } from "react";

import { SkipControls } from "./controlSections/SkipControls";
import { PlayPauseControls } from "./controlSections/PlayPauseControls";
import { SubtitleSelect } from "./SubtitleSelect";
import { FullscreenControl } from "./controlSections/FullscreenControl";
import { VolumeControl } from "./controlSections/VolumeControl";

interface VideoPlayerActionsBarProps {
  onSubtitleChange: (subtitleFilePath: string) => void;
  subtitleFilePath: string | null;
  renderSkipButton: (
    seconds: number,
    IconComponent: ElementType,
    label: string,
  ) => JSX.Element;
  isPlaying: boolean;
  onPlayPause: (isPlaying: boolean) => void;
  paused: boolean;
  onToggleFullscreen: () => void;
  isFullScreen: boolean;
  isNotMp4VideoFormat: boolean;
}

export const VideoPlayerActionsBar: React.FC<VideoPlayerActionsBarProps> = ({
  onSubtitleChange,
  subtitleFilePath,
  renderSkipButton,
  onPlayPause,
  onToggleFullscreen,
  isFullScreen,
  paused,
  isNotMp4VideoFormat,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 10px",
      }}
    >
      <Box sx={{ display: "flex" }}>
        <PlayPauseControls onPlayPause={onPlayPause} paused={paused} />
        <SkipControls renderSkipButton={renderSkipButton} />
        <FullscreenControl
          isFullScreen={isFullScreen}
          onToggleFullscreen={onToggleFullscreen}
        />
      </Box>
      <SubtitleSelect
        subtitleFilePath={subtitleFilePath}
        onSubtitleChange={onSubtitleChange}
      />
      {isNotMp4VideoFormat && <VolumeControl />}
    </Box>
  );
};
