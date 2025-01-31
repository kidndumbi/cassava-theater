import React, { useState } from "react";
import { Tooltip, IconButton, Menu, MenuItem } from "@mui/material";
import ClosedCaptionIcon from "@mui/icons-material/ClosedCaption";
import theme from "../../theme";
import useSelectFolder from "../../hooks/useSelectFolder";

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
  const { selectFile } = useSelectFolder();

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
      handleFilepathChange(selectedFilePath);
    }
  };

  const iconButton = (
    <IconButton
      sx={{
        left: 0,
        color: theme.customVariables.appWhiteSmoke,
        width: 48,
        height: 48,
      }}
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
