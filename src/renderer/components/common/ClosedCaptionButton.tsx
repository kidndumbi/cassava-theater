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

const ClosedCaptionButton: React.FC<ClosedCaptionButtonProps> = ({
  handleFilepathChange,
  subtitlePath,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuNone = () => {
    setAnchorEl(null);
    handleFilepathChange("None");
  };

  const handleMenuSelectCC = async () => {
    setAnchorEl(null);
    const selectedFilePath = await selectFile();
    if (selectedFilePath) {
      if (selectedFilePath.endsWith(".srt")) {
        const convertedFilePath = await convertSrtToVtt(selectedFilePath);

        handleFilepathChange(convertedFilePath);
      } else {
        handleFilepathChange(selectedFilePath);
      }
    }
  };

  return (
    <>
      <AppIconButton
        className="left-0 h-12 w-12"
        onClick={handleMenuClick}
        tooltip={subtitlePath ? subtitlePath : "None"}
      >
        <ClosedCaptionIcon />
      </AppIconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuNone}>None</MenuItem>
        <MenuItem onClick={handleMenuSelectCC}>Select CC</MenuItem>
      </Menu>
    </>
  );
};

export default ClosedCaptionButton;
