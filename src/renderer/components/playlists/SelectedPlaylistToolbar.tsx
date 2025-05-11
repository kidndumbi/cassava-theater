import { Box, Typography } from "@mui/material";
import AppIconButton from "../common/AppIconButton";
import { PlaylistModel } from "../../../models/playlist.model";

export const SelectedPlaylistToolbar = ({
  playlist,
  onRename,
  onDelete,
}: {
  playlist: PlaylistModel;
  onRename: () => void;
  onDelete: () => void;
}) => (
  <Box className="flex gap-2 pb-3 items-center">
    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
      {playlist.name}
    </Typography>
    <AppIconButton tooltip="Rename playlist" onClick={onRename}>
      {/* You can use EditIcon here if available */}
      <span role="img" aria-label="rename">
        ✏️
      </span>
    </AppIconButton>
    <AppIconButton tooltip="Delete playlist" onClick={onDelete}>
      {/* You can use DeleteIcon here if available */}
      <span role="img" aria-label="delete">
        🗑️
      </span>
    </AppIconButton>

  </Box>
);
