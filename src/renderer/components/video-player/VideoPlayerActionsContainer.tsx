import React from "react";
import Box from "@mui/material/Box";
import SkipButton from "./SkipButton";
import { VideoPlayerActionsBar } from "./VideoPlayerActionsBar";
import { useVideoPlayer } from "../../hooks/useVideoPlayer";
import "./VideoPlayerActionsContainer.css";

interface VideoPlayerActionsContainerProps {
  onSubtitleChange: (subtitle: string | null) => void;
  subtitleFilePath: string | null;
  skip: (seconds: number) => void;
  onToggleFullscreen: () => void;
}

const VideoPlayerActionsContainer: React.FC<
  VideoPlayerActionsContainerProps
> = ({ onSubtitleChange, subtitleFilePath, skip, onToggleFullscreen }) => {
  const { isFullScreen, paused, play, pause } = useVideoPlayer();

  return (
    <Box className="video-player-actions-container">
      <VideoPlayerActionsBar
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
