import React, { FC } from "react";
import Box from "@mui/material/Box";
import { NoteModel } from "../../../../models/note.model"; // Adjust the import to your actual path
import { NoteChip } from "./NoteChip";
import { NoteActions } from "./NoteActions"; // Assuming you have this import

type NoteHeaderProps = {
  edit: boolean;
  note: NoteModel;
  onClickChip: () => void;
  onClickEdit: () => void;
  onClickDelete: () => void;
};

const NoteHeader: FC<NoteHeaderProps> = ({
  edit,
  note,
  onClickChip,
  onClickEdit,
  onClickDelete,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        minHeight: "40.28px",
      }}
    >
      <NoteChip note={note} onClick={onClickChip} />
      <NoteActions
        edit={edit}
        onClickEdit={onClickEdit}
        onClickDelete={onClickDelete}
      />
    </Box>
  );
};

export { NoteHeader };
