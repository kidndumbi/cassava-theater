import React, { FC } from "react";
import { Box, IconButton } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

type NoteActionsProps = {
  edit: boolean;
  onClickEdit: () => void;
  onClickDelete: () => void;
};

const NoteActions: FC<NoteActionsProps> = ({
  edit,
  onClickEdit,
  onClickDelete,
}) => {
  if (edit) return null;

  return (
    <Box>
      <IconButton
        aria-label="edit"
        size="medium"
        color="primary"
        onClick={onClickEdit}
      >
        <EditIcon fontSize="small" />
      </IconButton>
      <IconButton
        aria-label="delete"
        size="medium"
        color="primary"
        onClick={onClickDelete}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
    </Box>
  );
};

export { NoteActions };
