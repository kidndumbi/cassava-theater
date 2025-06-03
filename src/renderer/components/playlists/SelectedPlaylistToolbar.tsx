import { Box, Menu, MenuItem, SxProps, Theme } from "@mui/material";
import AppIconButton from "../common/AppIconButton";
import {
  ListDisplayType,
  PlaylistModel,
} from "../../../models/playlist.model";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArtTrackIcon from "@mui/icons-material/ArtTrack";
import { useEffect, useState } from "react";
import theme from "../../theme";
import ListIcon from "@mui/icons-material/List";
import GridViewIcon from "@mui/icons-material/GridView";

export const SelectedPlaylistToolbar = ({
  playlist,
  onRename,
  onDelete,
  onPlayFromBeginning,
  onPlayFromLastWatched,
  onShuffle,
  updatePlaylist,
}: {
  playlist: PlaylistModel;
  onRename: () => void;
  onDelete: () => void;
  onPlayFromBeginning: () => void;
  onPlayFromLastWatched: () => void;
  onShuffle: () => void;
  updatePlaylist: (id: string, playlist: PlaylistModel) => void;
}) => {
  const [playAnchorEl, setPlayAnchorEl] = useState<null | HTMLElement>(null);
  const [displayTypeEl, setDisplayTypeEl] = useState<null | HTMLElement>(null);
  const [displayType, setDisplayType] = useState<ListDisplayType>(
    playlist.display || "grid",
  );

  useEffect(() => {
    if (playlist.display) {
      setDisplayType(playlist.display);
    }
  }, [playlist.display]);

  const handlePlayClick = (event: React.MouseEvent<HTMLElement>) => {
    setPlayAnchorEl(event.currentTarget);
  };

  const handlePlayMenuClose = () => {
    setPlayAnchorEl(null);
  };

  const handlePlay = () => {
    onPlayFromBeginning();
    handlePlayMenuClose();
  };

  const handleShuffle = () => {
    onShuffle();
    handlePlayMenuClose();
  };

  const menuPaperStyles: SxProps<Theme> = {
    "& .MuiPaper-root": {
      backgroundColor: theme.customVariables.appDark,
    },
  };

  const menuItemStyles = (color?: string): SxProps<Theme> => ({
    color: color || theme.customVariables.appWhiteSmoke,
  });

  const handleDisplayTypeChange = (type: ListDisplayType) => {
    setDisplayType(type);
    updatePlaylist(playlist.id, { ...playlist, display: type });
    setDisplayTypeEl(null);
  };

  return (
    <Box className="flex items-center gap-2 pb-3">
      <AppIconButton
        tooltip="play or shuffle playlist"
        onClick={handlePlayClick}
      >
        <PlayArrowIcon />
      </AppIconButton>
      <Menu
        anchorEl={playAnchorEl}
        open={Boolean(playAnchorEl)}
        onClose={handlePlayMenuClose}
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
      <AppIconButton
        tooltip="Display"
        onClick={(event) => setDisplayTypeEl(event.currentTarget)}
      >
        <ArtTrackIcon />
      </AppIconButton>
      <Menu
        anchorEl={displayTypeEl}
        open={Boolean(displayTypeEl)}
        onClose={() => setDisplayTypeEl(null)}
        sx={menuPaperStyles}
      >
        {(["grid", "list"] as ListDisplayType[]).map((type) => {
          return (
            <MenuItem
              key={type}
              selected={displayType === type}
              sx={{
                ...menuItemStyles(),
                fontWeight: displayType === type ? "bold" : "normal",
                backgroundColor:
                  displayType === type ? theme.palette.primary.dark : undefined,
                borderRadius: displayType === type ? 2 : undefined,
                "&:hover": {
                  backgroundColor: theme.palette.primary.main,
                },
              }}
              onClick={() => handleDisplayTypeChange(type)}
            >
              <Box className="flex items-center gap-2">
                {type === "grid" ? (
                  <GridViewIcon fontSize="small" />
                ) : (
                  <ListIcon fontSize="small" />
                )}
                <span>{type === "grid" ? "Grid View" : "List View"}</span>
              </Box>
            </MenuItem>
          );
        })}
      </Menu>
      <AppIconButton tooltip="Delete playlist" onClick={onDelete}>
        <DeleteIcon />
      </AppIconButton>
    </Box>
  );
};
