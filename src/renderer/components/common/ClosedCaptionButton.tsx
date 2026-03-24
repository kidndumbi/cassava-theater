import React, { useState } from "react";
import { Menu, MenuItem } from "@mui/material";
import ClosedCaptionIcon from "@mui/icons-material/ClosedCaption";
import { selectFile } from "../../util/helperFunctions";
import AppIconButton from "./AppIconButton";
import { SubtitleLanguagesModal } from "./SubtitleLanguagesModal";
import { VideoDataModel } from "../../../models/videoData.model";

interface ClosedCaptionButtonProps {
  handleFilepathChange?: (folderPath: string) => void; // Keep for backward compatibility
  subtitlePath: string;
  handleAdjustTiming?: () => void;
  videoData?: VideoDataModel; // New prop for the enhanced modal
  onSubtitleUpdate?: (subtitleData: {
    subtitlePath?: string | null;
    subtitlePathEs?: string | null;
    subtitlePathFr?: string | null;
    activeSubtitleLanguage?: 'en' | 'es' | 'fr' | null;
  }) => Promise<void>; // New prop for saving subtitle data
  onSubtitleModalStateChange?: (isOpen: boolean) => void; // Track modal state
}

const getMenuItems = (handleAdjustTiming?: () => void) => [
  {
    label: "None",
    action: (handleChange: (path: string) => void) => {
      handleChange("None");
    },
  },
  {
    label: "Select CC",
    action: async (handleChange: (path: string) => void) => {
      const selectedFilePath = await selectFile();
      if (!selectedFilePath) return;

      const filePath = selectedFilePath.endsWith(".srt")
        ? await window.fileManagerAPI.convertSrtToVtt(selectedFilePath)
        : selectedFilePath;

      handleChange(filePath);
    },
  },
  {
    label: "Adjust Timing",
    action: async (handleChange: (path: string) => void) => {
      if (handleAdjustTiming) {
        handleAdjustTiming();
      } else {
        handleChange("adjust-timing");
      }
    },
  },
];

export const ClosedCaptionButton: React.FC<ClosedCaptionButtonProps> = ({
  handleFilepathChange,
  subtitlePath,
  handleAdjustTiming,
  videoData,
  onSubtitleUpdate,
  onSubtitleModalStateChange,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const isMenuOpen = Boolean(anchorEl);
  
  const menuItems = getMenuItems(handleAdjustTiming);

  const handleMenuToggle = (event: React.MouseEvent<HTMLElement>) => {
    // If we have the new props, open the modal instead of the menu
    if (videoData && onSubtitleUpdate) {
      handleModalOpen();
    } else {
      // Fallback to old behavior for backward compatibility
      setAnchorEl(event.currentTarget);
    }
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    // Notify parent that modal is closed
    if (onSubtitleModalStateChange) {
      onSubtitleModalStateChange(false);
    }
  };

  const handleModalOpen = () => {
    setModalOpen(true);
    // Notify parent that modal is open
    if (onSubtitleModalStateChange) {
      onSubtitleModalStateChange(true);
    }
  };

  const handleMenuItemClick = async (
    menuAction: (typeof menuItems)[number]["action"],
  ) => {
    await menuAction(handleFilepathChange!);
    handleMenuClose();
  };

  const getTooltipText = () => {
    if (!videoData) return subtitlePath || "None";
    
    const { activeSubtitleLanguage, subtitlePath: enPath, subtitlePathEs, subtitlePathFr } = videoData;
    
    if (!activeSubtitleLanguage) return "None";
    
    const languageMap = {
      en: { name: "English", path: enPath },
      es: { name: "Spanish", path: subtitlePathEs },
      fr: { name: "French", path: subtitlePathFr },
    };
    
    const activeLanguageData = languageMap[activeSubtitleLanguage];
    return activeLanguageData?.path 
      ? `${activeLanguageData.name}: ${activeLanguageData.path.split(/[/\\]/).pop()}`
      : "None";
  };

  return (
    <>
      <AppIconButton
        className="left-0 h-12 w-12"
        onClick={handleMenuToggle}
        tooltip={getTooltipText()}
        aria-label="Closed caption options"
      >
        <ClosedCaptionIcon />
      </AppIconButton>

      {/* Legacy Menu for backward compatibility */}
      {!videoData && (
        <Menu
          anchorEl={anchorEl}
          open={isMenuOpen}
          onClose={handleMenuClose}
          MenuListProps={{
            "aria-labelledby": "closed-caption-menu",
          }}
        >
          {menuItems.map((item, index) => (
            <MenuItem
              key={index}
              onClick={() => handleMenuItemClick(item.action)}
            >
              {item.label}
            </MenuItem>
          ))}
        </Menu>
      )}

      {/* New Languages Modal */}
      {videoData && onSubtitleUpdate && (
        <SubtitleLanguagesModal
          open={modalOpen}
          onClose={handleModalClose}
          videoData={videoData}
          onSave={onSubtitleUpdate}
        />
      )}
    </>
  );
};
