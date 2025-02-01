import React, { JSX } from "react";
import { Forward30, Forward10, Forward5 } from "@mui/icons-material";
import Replay5Icon from "@mui/icons-material/Replay5";
import Replay10Icon from "@mui/icons-material/Replay10";
import Replay30Icon from "@mui/icons-material/Replay30";
import { Box } from "@mui/material";

interface SkipControlsProps {
  renderSkipButton: (
    seconds: number,
    IconComponent: any,
    label: string
  ) => JSX.Element;
}

const skipSettings = [
  { seconds: +30, Icon: Forward30, label: "forward 30 seconds" },
  { seconds: +10, Icon: Forward10, label: "forward 10 seconds" },
  { seconds: +5, Icon: Forward5, label: "forward 5 seconds" },
  { seconds: -5, Icon: Replay5Icon, label: "replay 5 seconds" },
  { seconds: -10, Icon: Replay10Icon, label: "replay 10 seconds" },
  { seconds: -30, Icon: Replay30Icon, label: "replay 30 seconds" },
];

export const SkipControls: React.FC<SkipControlsProps> = ({
  renderSkipButton,
}) => {
  return (
    <>
      {skipSettings.map(({ seconds, Icon, label }) => (
        <Box key={label}>{renderSkipButton(seconds, Icon, label)}</Box>
      ))}
    </>
  );
};
