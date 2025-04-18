import React from "react";
import { Chip } from "@mui/material";
import theme from "../../theme";
import { getFileExtension } from "../../util/helperFunctions";

interface VideoTypeChipProps {
  filePath: string;
}

export const VideoTypeChip: React.FC<VideoTypeChipProps> = ({ filePath }) => {
  const fileExtension = getFileExtension(filePath);
  const isMp4 = fileExtension === "mp4";
  
  const chipStyles = {
    color: isMp4 
      ? theme.customVariables.appWhiteSmoke 
      : theme.palette.primary.main,
    backgroundColor: theme.customVariables.appDark,
  };

  return (
    <Chip
      label={fileExtension}
      size="small"
      sx={chipStyles}
    />
  );
};