import React, { useState } from "react";
import { Menu, MenuItem } from "@mui/material";
import ClosedCaptionIcon from "@mui/icons-material/ClosedCaption";
import { selectFile } from "../../util/helperFunctions";
import { convertSrtToVtt } from "../../store/videoInfo/folderVideosInfoApi";
import AppIconButton from "./AppIconButton";

interface ClosedCaptionButtonProps {
  handleFilepathChange: (folderPath: string) => void;
  subtitlePath: string;
}

const menuItems = [
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
        ? await convertSrtToVtt(selectedFilePath)
        : selectedFilePath;

      handleChange(filePath);
    },
  },
];

export const ClosedCaptionButton: React.FC<ClosedCaptionButtonProps> = ({
  handleFilepathChange,
  subtitlePath,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleMenuToggle = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = async (menuAction: typeof menuItems[number]["action"]) => {
    await menuAction(handleFilepathChange);
    handleMenuClose();
  };

  return (
    <>
      <AppIconButton
        className="left-0 h-12 w-12"
        onClick={handleMenuToggle}
        tooltip={subtitlePath || "None"}
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
    </>
  );
};

