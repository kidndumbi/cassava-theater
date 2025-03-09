import React, { useState } from "react";
import { Tooltip, IconButton, Menu, MenuItem } from "@mui/material";
import ClosedCaptionIcon from "@mui/icons-material/ClosedCaption";
import theme from "../../theme";
import { selectFile } from "../../util/helperFunctions";
import { convertSrtToVtt } from "../../store/videoInfo/folderVideosInfoApi";

interface ClosedCaptionButtonProps {
  handleFilepathChange: (folderPath: string) => void;
  subtitlePath: string;
  showTooltip?: boolean; // Add new prop
}

const ClosedCaptionButton: React.FC<ClosedCaptionButtonProps> = ({
  handleFilepathChange,
  subtitlePath,
  showTooltip = false, // Set default value
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

  const iconButton = (
    <IconButton
      sx={{ color: theme.customVariables.appWhiteSmoke }} // retained for color
      className="left-0 w-12 h-12"
      onClick={handleMenuClick}
    >
      <ClosedCaptionIcon />
    </IconButton>
  );

  return (
    <>
      {showTooltip ? (
        <Tooltip title={subtitlePath ? subtitlePath : "None"}>
          {iconButton}
        </Tooltip>
      ) : (
        iconButton
      )}
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
