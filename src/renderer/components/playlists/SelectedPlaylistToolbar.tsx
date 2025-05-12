import { Box, Typography } from "@mui/material";
import AppIconButton from "../common/AppIconButton";
import { PlaylistModel } from "../../../models/playlist.model";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ShuffleIcon from "@mui/icons-material/Shuffle";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export const SelectedPlaylistToolbar = ({
  playlist,
  onRename,
  onDelete,
  onPlay,
  onShuffle,
}: {
  playlist: PlaylistModel;
  onRename: () => void;
  onDelete: () => void;
  onPlay: () => void;
  onShuffle: () => void;
}) => (
  <Box className="flex items-center gap-2 pb-3">
    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
      {playlist.name}
    </Typography>
    <AppIconButton tooltip="play playlist" onClick={onPlay}>
      <PlayArrowIcon />
    </AppIconButton>
    <AppIconButton tooltip="shuffle playlist" onClick={onShuffle}>
      <ShuffleIcon />
    </AppIconButton>
    <AppIconButton tooltip="Rename playlist" onClick={onRename}>
      <EditIcon />
    </AppIconButton>
    <AppIconButton tooltip="Delete playlist" onClick={onDelete}>
      <DeleteIcon />
    </AppIconButton>
  </Box>
);
