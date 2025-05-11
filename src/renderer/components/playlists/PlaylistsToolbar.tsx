import { Box } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import AppIconButton from "../common/AppIconButton";

export const PlaylistsToolbar = ({ onAdd }: { onAdd: () => void }) => (
  <Box className="flex gap-2 pb-5">
    <AppIconButton tooltip="Add new playlist" onClick={onAdd}>
      <AddIcon />
    </AppIconButton>
  </Box>
);
