import { Box, Menu, MenuItem, SxProps, Theme } from "@mui/material";
import AppIconButton from "../common/AppIconButton";
import { PlaylistModel } from "../../../models/playlist.model";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useState } from "react";
import theme from "../../theme";

export const SelectedPlaylistToolbar = ({
  playlist,
  onRename,
  onDelete,
  onPlayFromBeginning,
  onPlayFromLastWatched,
  onShuffle,
}: {
  playlist: PlaylistModel;
  onRename: () => void;
  onDelete: () => void;
  onPlayFromBeginning: () => void;
  onPlayFromLastWatched: () => void;
  onShuffle: () => void;
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handlePlayClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handlePlay = () => {
    onPlayFromBeginning();
    handleMenuClose();
  };

  const handleShuffle = () => {
    onShuffle();
    handleMenuClose();
  };

  const menuPaperStyles: SxProps<Theme> = {
    "& .MuiPaper-root": {
      backgroundColor: theme.customVariables.appDark,
    },
  };

  const menuItemStyles = (color?: string): SxProps<Theme> => ({
    color: color || theme.customVariables.appWhiteSmoke,
  });

  return (
    <Box className="flex items-center gap-2 pb-3">
      <AppIconButton
        tooltip="play or shuffle playlist"
        onClick={handlePlayClick}
      >
        <PlayArrowIcon />
      </AppIconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        sx={menuPaperStyles}
      >
        <MenuItem sx={menuItemStyles()} onClick={handlePlay}>
          Play from beginning
        </MenuItem>
        {playlist?.lastVideoPlayed && (
          <MenuItem sx={menuItemStyles()} onClick={onPlayFromLastWatched}>
            Play from last watched
          </MenuItem>
        )}

        <MenuItem sx={menuItemStyles()} onClick={handleShuffle}>
          Shuffle
        </MenuItem>
      </Menu>
      <AppIconButton tooltip="Rename playlist" onClick={onRename}>
        <EditIcon />
      </AppIconButton>
      <AppIconButton tooltip="Delete playlist" onClick={onDelete}>
        <DeleteIcon />
      </AppIconButton>
    </Box>
  );
};
