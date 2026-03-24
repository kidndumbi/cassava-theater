import { Box, Chip } from "@mui/material";

import React, { useState } from "react";
import { getFilename } from "../../util/helperFunctions";
import { ClosedCaptionButton } from "../common/ClosedCaptionButton";
import { VideoDataModel } from "../../../models/videoData.model";
import { useSubtitle } from "../../hooks/useSubtitle";

interface SubtitleSelectProps {
  subtitleFilePath: string | null;
  onSubtitleChange: (subtitle: string) => void;
  handleAdjustTiming?: () => void;
  videoData?: VideoDataModel; // New prop for enhanced functionality
  onVideoDataUpdate?: (videoData: VideoDataModel) => void; // Callback when video data is updated
  onSubtitleModalStateChange?: (isOpen: boolean) => void; // Track modal state for mouse activity
}

export const SubtitleSelect: React.FC<SubtitleSelectProps> = ({
  subtitleFilePath,
  onSubtitleChange,
  handleAdjustTiming,
  videoData,
  onVideoDataUpdate,
  onSubtitleModalStateChange,
}) => {
  const [selectedSubtitleFilePath, setSelectedSubtitleFilePath] = useState(
    subtitleFilePath || "None"
  );

  const { updateSubtitleLanguages, getActiveSubtitlePath } = useSubtitle();

  // Legacy handler for backward compatibility
  const handleFilepathChange = (filePath: string) => {
    const newFilePath = filePath === "None" ? "None" : filePath;
    setSelectedSubtitleFilePath(newFilePath);
    onSubtitleChange(newFilePath === "None" ? "" : newFilePath);
  };

  // New handler for multi-language subtitle updates
  const handleSubtitleUpdate = async (subtitleData: {
    subtitlePath?: string | null;
    subtitlePathEs?: string | null;
    subtitlePathFr?: string | null;
    activeSubtitleLanguage?: 'en' | 'es' | 'fr' | null;
  }) => {
    if (!videoData) return;

    await updateSubtitleLanguages(subtitleData, videoData);
    
    // Update the active subtitle path for the video player
    const activeSubtitlePath = getActiveSubtitlePath({
      ...videoData,
      ...subtitleData,
    });
    
    setSelectedSubtitleFilePath(activeSubtitlePath || "None");
    onSubtitleChange(activeSubtitlePath || "");

    // Notify parent component of the update
    if (onVideoDataUpdate) {
      const updatedVideoData = { ...videoData, ...subtitleData };
      onVideoDataUpdate(updatedVideoData);
    }
  };

  // Get display text for the chip
  const getDisplayText = () => {
    if (videoData) {
      const activeLanguage = videoData.activeSubtitleLanguage;
      if (!activeLanguage) return "None";
      
      const languageMap = {
        en: { name: "EN", path: videoData.subtitlePath },
        es: { name: "ES", path: videoData.subtitlePathEs },
        fr: { name: "FR", path: videoData.subtitlePathFr },
      };
      
      const activeData = languageMap[activeLanguage];
      return activeData?.path ? `${activeData.name}: ${getFilename(activeData.path)}` : "None";
    }
    
    // Fallback to legacy behavior
    return getFilename(selectedSubtitleFilePath);
  };

  return (
    <Box className="flex items-center gap-2">
      <ClosedCaptionButton
        subtitlePath={selectedSubtitleFilePath}
        handleFilepathChange={videoData ? undefined : handleFilepathChange} // Only pass for legacy mode
        handleAdjustTiming={handleAdjustTiming}
        videoData={videoData}
        onSubtitleUpdate={videoData ? handleSubtitleUpdate : undefined}
        onSubtitleModalStateChange={onSubtitleModalStateChange}
      />
      <Chip
        color="secondary"
        label={getDisplayText()}
        variant="outlined"
      />
    </Box>
  );
};
