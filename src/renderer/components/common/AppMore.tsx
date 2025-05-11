import React from "react";
import { Menu, MenuItem, SxProps, Theme } from "@mui/material";
import theme from "../../theme";
import { VideoDataModel } from "../../../models/videoData.model";
import { ConversionQueueItem } from "../../../models/conversion-queue-item.model";
import { removeVidExt } from "../../util/helperFunctions";

interface AppMoreProps {
  open: boolean;
  anchorPosition: { top: number; left: number } | null;
  onClose: () => void;
  isMovie: boolean;
  handleDelete: () => void;
  linkTheMovieDb: () => void;
  isNotMp4?: boolean;
  handleConvertToMp4?: () => void;
  videoData: VideoDataModel;
  handleWatchLaterUpdate?: (
    filePath: string,
    watchLater: boolean,
  ) => Promise<void>;
  handlePlaylistUpdate?: () => void;
}

interface MenuItemConfig {
  label: string;
  action: () => void;
  sx: SxProps<Theme>;
}

const menuPaperStyles: SxProps<Theme> = {
  "& .MuiPaper-root": {
    backgroundColor: theme.customVariables.appDark,
  },
};

const menuItemStyles = (color?: string): SxProps<Theme> => ({
  color: color || theme.customVariables.appWhiteSmoke,
});

export const AppMore: React.FC<AppMoreProps> = ({
  open,
  anchorPosition,
  onClose,
  isMovie,
  handleDelete,
  linkTheMovieDb,
  isNotMp4 = false,
  handleConvertToMp4,
  videoData,
  handleWatchLaterUpdate,
  handlePlaylistUpdate,
}) => {
  const [menuItems, setMenuItems] = React.useState<MenuItemConfig[]>([]);

  React.useEffect(() => {
    const prepareMenuItems = async () => {
      const items = [
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
        const conversionQueue =
          (await window.mp4ConversionAPI.getConversionQueue()) as ConversionQueueItem[];
        const isInQueue = conversionQueue.some(
          (item) =>
            item.inputPath === videoData.filePath && item.status !== "failed",
        );
        if (!isInQueue) {
          items.push({
            label: "Convert to MP4",
            action: handleConvertToMp4,
            sx: menuItemStyles(theme.palette.warning.main),
          });
        }
      }

      if (isMovie) {
        items.push({
          label: !videoData.watchLater
            ? "Add to Watch Later"
            : "Remove from Watch Later",
          action: () =>
            handleWatchLaterUpdate &&
            handleWatchLaterUpdate(videoData.filePath, !videoData.watchLater),
          sx: menuItemStyles(),
        });

        items.push({
          label: "Playlists",
          action: () => handlePlaylistUpdate && handlePlaylistUpdate(),
          sx: menuItemStyles(),
        });
      }
      setMenuItems(items);
    };

    if (open) {
      prepareMenuItems();
    }
  }, [
    open,
    isMovie,
    isNotMp4,
    videoData,
    handleConvertToMp4,
    handleWatchLaterUpdate,
    handlePlaylistUpdate,
  ]);

  const handleMenuItemClick = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <Menu
      open={open}
      onClose={onClose}
      anchorReference="anchorPosition"
      anchorPosition={
        anchorPosition
          ? { top: anchorPosition.top, left: anchorPosition.left }
          : undefined
      }
      sx={menuPaperStyles}
    >
      <MenuItem
        disabled
        sx={{
          opacity: 1,
          fontWeight: "bold",
          pointerEvents: "none",
          color: theme.customVariables.appWhiteSmoke,
        }}
      >
        {removeVidExt(videoData?.fileName)}
      </MenuItem>
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
  );
};
