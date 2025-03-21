import React from "react";
import Box from "@mui/material/Box";
import SkipButton from "./SkipButton";
import { VideoPlayerActionsBar } from "./VideoPlayerActionsBar";
import "./VideoPlayerActionsContainer.css";

interface VideoPlayerActionsContainerProps {
  onSubtitleChange: (subtitle: string | null) => void;
  subtitleFilePath: string | null;
  skip: (seconds: number) => void;
  onToggleFullscreen: () => void;
  isFullScreen: boolean;
  paused?: boolean;
  play: () => void;
  pause: () => void;
  isNotMp4VideoFormat: boolean; 
}

const VideoPlayerActionsContainer: React.FC<
  VideoPlayerActionsContainerProps
> = ({
  onSubtitleChange,
  subtitleFilePath,
  skip,
  onToggleFullscreen,
  isFullScreen,
  paused,
  play,
  pause,
  isNotMp4VideoFormat,
}) => {

  return (
    <Box className="video-player-actions-container">
      <VideoPlayerActionsBar
      isNotMp4VideoFormat={isNotMp4VideoFormat}
        onSubtitleChange={onSubtitleChange}
        subtitleFilePath={subtitleFilePath}
        renderSkipButton={(seconds, IconComponent, label) => (
          <SkipButton
            skip={skip}
            seconds={seconds}
            IconComponent={IconComponent}
            label={label}
          />
        )}
        isPlaying={!paused}
        onToggleFullscreen={onToggleFullscreen}
        isFullScreen={isFullScreen}
        paused={paused || false}
        onPlayPause={(isPlaying) => {
          if (isPlaying) {
            pause();
          } else {
            play();
          }
        }}
      />
    </Box>
  );
};

export default VideoPlayerActionsContainer;
