import { FC } from "react";
import LinearProgress from "@mui/material/LinearProgress";
import React from "react";

interface VideoProgressBarProps {
  current: number;
  total: number;
}

const VideoProgressBar: FC<VideoProgressBarProps> = ({ current, total }) => {
  const normalizedCurrent = (current / total) * 100;

  return (
    <LinearProgress
      color="secondary"
      variant="buffer"
      value={normalizedCurrent}
      valueBuffer={100}
    />
  );
};

export { VideoProgressBar };
