import { FC } from "react";
import LinearProgress from "@mui/material/LinearProgress";

interface VideoProgressBarProps {
  current: number;
  total: number;
  color?: "primary" | "secondary";
}

const VideoProgressBar: FC<VideoProgressBarProps> = ({
  current,
  total,
  color = "secondary",
}) => {
  const normalizedCurrent = (current / total) * 100;

  return (
    <LinearProgress
      color={color}
      variant="buffer"
      value={normalizedCurrent}
      valueBuffer={100}
    />
  );
};

export { VideoProgressBar };
