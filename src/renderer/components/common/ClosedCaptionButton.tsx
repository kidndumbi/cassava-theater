import React, { useState } from "react";
import { Menu, MenuItem } from "@mui/material";
import ClosedCaptionIcon from "@mui/icons-material/ClosedCaption";
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

const getMenuItems = (
  handleAdjustTiming?: () => void,
  handleOpenModal?: () => void
) => [
  {
    label: "Manage Subtitles",
    action: async () => {
      if (handleOpenModal) handleOpenModal();
    },
  },
  {
    label: "Adjust Timing",
    action: async () => {
      if (handleAdjustTiming) handleAdjustTiming();
    },
  },
];

export const ClosedCaptionButton: React.FC<ClosedCaptionButtonProps> = ({
  subtitlePath,
  handleAdjustTiming,
  videoData,
  onSubtitleUpdate,
  onSubtitleModalStateChange,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const isMenuOpen = Boolean(anchorEl);

  const handleModalOpen = () => {
    setModalOpen(true);
    if (onSubtitleModalStateChange) {
      onSubtitleModalStateChange(true);
    }
  };

  const menuItems = getMenuItems(handleAdjustTiming, handleModalOpen);

  const handleMenuToggle = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    if (onSubtitleModalStateChange) {
      onSubtitleModalStateChange(false);
    }
  };

  const handleMenuItemClick = async (
    menuAction: (typeof menuItems)[number]["action"],
  ) => {
    await menuAction();
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

      {/* Languages Modal */}
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
