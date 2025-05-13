import { Box } from "@mui/material";
import React, { ElementType, JSX } from "react";

import { SkipControls } from "./controlSections/SkipControls";
import { PlayPauseControls } from "./controlSections/PlayPauseControls";
import { SubtitleSelect } from "./SubtitleSelect";
import { FullscreenControl } from "./controlSections/FullscreenControl";
import { VolumeControl } from "./controlSections/VolumeControl";
import AppIconButton from "../common/AppIconButton";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

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
  onStartFromBeginning: () => void;
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
  onStartFromBeginning
}) => {
  return (
    <Box className="flex items-center justify-between px-2.5">
      <Box className="flex">
        <PlayPauseControls onPlayPause={onPlayPause} paused={paused} />
        <SkipControls renderSkipButton={renderSkipButton} />
        <AppIconButton
          aria-label="start-from-beginning"
          tooltip=""
          onClick={onStartFromBeginning}
        >
          <RestartAltIcon />
        </AppIconButton>
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
