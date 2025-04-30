import React from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Menu, MenuItem, SxProps, Theme } from "@mui/material";
import theme from "../../theme";
import AppIconButton from "./AppIconButton";
import { VideoDataModel } from "../../../models/videoData.model";

interface AppMoreProps {
  handleDelete: () => void;
  isMovie: boolean;
  linkTheMovieDb: () => void;
  isNotMp4?: boolean;
  handleConvertToMp4?: () => void;
  videoData: VideoDataModel;
  handleWatchLaterUpdate?: (filePath: string, watchLater: boolean) => Promise<void>
}

const iconButtonStyles: SxProps<Theme> = {
  color: theme.customVariables.appWhiteSmoke,
  width: "30px",
  height: "30px",
  backgroundColor: theme.customVariables.appDark,
  "&:hover": {
    backgroundColor: theme.customVariables.appDark,
  },
};

const menuPaperStyles: SxProps<Theme> = {
  "& .MuiPaper-root": {
    backgroundColor: theme.customVariables.appDark,
  },
};

const menuItemStyles = (color?: string): SxProps<Theme> => ({
  color: color || theme.customVariables.appWhiteSmoke,
});

export const AppMore: React.FC<AppMoreProps> = ({
  handleDelete,
  isMovie,
  linkTheMovieDb,
  isNotMp4 = false,
  handleConvertToMp4,
  videoData,
  handleWatchLaterUpdate,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (action: () => void) => {
    action();
    handleClose();
  };

  const menuItems = [
    {
      label: "Delete",
      action: handleDelete,
      sx: menuItemStyles(theme.palette.error.main),
    },
    {
      label: isMovie ? "Link Movie Info" : "Link TV Show Info",
      action: linkTheMovieDb,
      sx: menuItemStyles(),
    },

  ];

  if (isMovie && isNotMp4 && handleConvertToMp4) {
    menuItems.push({
      label: "Convert to MP4",
      action: handleConvertToMp4, // Replace with actual path or logic to get the path
      sx: menuItemStyles(theme.palette.warning.main),
    });
  }

  if (isMovie) {
    menuItems.push({
      label: !videoData.watchLater ? "Add to Watch Later" : "Remove from Watch Later",
      action: () => handleWatchLaterUpdate(videoData.filePath, !videoData.watchLater), // Replace with actual path or logic to get the path
      sx: menuItemStyles(),
    });
  }

  return (
    <>
      <AppIconButton
        tooltip="more options"
        onClick={handleClick}
        className="left-0"
        sx={iconButtonStyles}
      >
        <MoreVertIcon />
      </AppIconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
        sx={menuPaperStyles}
      >
        {menuItems.map((item, index) => (
          <MenuItem
            key={index}
            onClick={() => handleMenuItemClick(item.action)}
            sx={item.sx}
          >
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};