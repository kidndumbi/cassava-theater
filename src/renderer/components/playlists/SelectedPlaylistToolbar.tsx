import { Box, Menu, MenuItem, SxProps, Theme } from "@mui/material";
import AppIconButton from "../common/AppIconButton";
import { ListDisplayType, PlaylistModel } from "../../../models/playlist.model";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArtTrackIcon from "@mui/icons-material/ArtTrack";
import { useEffect, useState } from "react";
import theme from "../../theme";
import ListIcon from "@mui/icons-material/List";
import GridViewIcon from "@mui/icons-material/GridView";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import { AppModal } from "../common/AppModal";
import { useModalState } from "../../hooks/useModalState";

export const SelectedPlaylistToolbar = ({
  playlist,
  onRename,
  onDelete,
  onPlayFromBeginning,
  onPlayFromLastWatched,
  onShuffle,
  updatePlaylist,
  nonExistentVideos,
  onClearMissingVideos,
}: {
  playlist: PlaylistModel;
  onRename: () => void;
  onDelete: () => void;
  onPlayFromBeginning: () => void;
  onPlayFromLastWatched: () => void;
  onShuffle: () => void;
  updatePlaylist: (id: string, playlist: PlaylistModel) => void;
  nonExistentVideos: string[];
  onClearMissingVideos: () => void;
}) => {
  const [playAnchorEl, setPlayAnchorEl] = useState<null | HTMLElement>(null);
  const [displayTypeEl, setDisplayTypeEl] = useState<null | HTMLElement>(null);
  const [displayType, setDisplayType] = useState<ListDisplayType>(
    playlist.display || "grid",
  );
  const { open, openModal, closeModal } = useModalState(false);

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
    <>
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
                    displayType === type
                      ? theme.palette.primary.dark
                      : undefined,
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
        {nonExistentVideos.length > 0 && (
          <AppIconButton
            tooltip="view videos not found!"
            onClick={() => {
              console.log("Non-existent videos:", nonExistentVideos);
              openModal();
            }}
          >
            <PriorityHighIcon color="error" />
          </AppIconButton>
        )}

        <AppIconButton tooltip="Delete playlist" onClick={onDelete}>
          <DeleteIcon />
        </AppIconButton>
      </Box>
      <AppModal open={open} onClose={closeModal} title="Videos Not Found">
        <Box sx={{ minWidth: 350, maxWidth: 500 }}>
          <Box
            className="mb-3 flex items-center justify-between"
            sx={{
              p: 1,
              borderRadius: 1,
              bgcolor: "error.lighter",
            }}
          >
            <Box sx={{ fontWeight: "bold", fontSize: 16, color: "error.main" }}>
              {nonExistentVideos.length} video
              {nonExistentVideos.length !== 1 ? "s" : ""} not found
            </Box>
            <AppIconButton
              tooltip="Clear all missing videos"
              onClick={() => {
                onClearMissingVideos();
                closeModal();
              }}
              color="error"
            >
              <DeleteIcon />
            </AppIconButton>
          </Box>
          <Box sx={{ maxHeight: 300, overflowY: "auto" }}>
            {nonExistentVideos.map((path, idx) => (
              <Box
                key={path}
                className="mb-2 flex items-center"
                sx={{
                  p: 1,
                  borderRadius: 1,
                  bgcolor: "error.lighter",
                  fontSize: 14,
                }}
              >
                <Box
                  sx={{ wordBreak: "break-all", flex: 1, color: "error.main" }}
                >
                  {path}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </AppModal>
    </>
  );
};
