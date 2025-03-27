import { Box, Chip } from "@mui/material";

import React, { useState } from "react";
import { getFilename } from "../../util/helperFunctions";
import { ClosedCaptionButton } from "../common/ClosedCaptionButton";

interface SubtitleSelectProps {
  subtitleFilePath: string | null;
  onSubtitleChange: (subtitle: string) => void;
}

export const SubtitleSelect: React.FC<SubtitleSelectProps> = ({
  subtitleFilePath,
  onSubtitleChange,
}) => {
  const [selectedSubtitleFilePath, setSelectedSubtitleFilePath] = useState(
    subtitleFilePath || "None"
  );

  const handleFilepathChange = (filePath: string) => {
    const newFilePath = filePath === "None" ? "None" : filePath;
    setSelectedSubtitleFilePath(newFilePath);
    onSubtitleChange(newFilePath === "None" ? "" : newFilePath);
  };

  return (
    <Box className="flex items-center gap-2" >
      <ClosedCaptionButton
        subtitlePath={selectedSubtitleFilePath}
        handleFilepathChange={handleFilepathChange}
      />
      <Chip
        color="secondary"
        label={getFilename(selectedSubtitleFilePath)}
        variant="outlined"
      />
    </Box>
  );
};
