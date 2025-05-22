import { Box } from "@mui/material";
import AppIconButton from "../common/AppIconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

interface SelectedCustomFolderToolbarProps {
  onEdit: () => void;
  onDelete: () => void;
}

export const SelectedCustomFolderToolbar = ({
  onDelete,
  onEdit,
}: SelectedCustomFolderToolbarProps) => {
  return (
    <Box className="flex items-center gap-2 pb-3">
      <AppIconButton tooltip="Rename folder" onClick={onEdit}>
        <EditIcon />
      </AppIconButton>
      <AppIconButton tooltip="Delete folder" onClick={onDelete}>
        <DeleteIcon />
      </AppIconButton>
    </Box>
  );
};
