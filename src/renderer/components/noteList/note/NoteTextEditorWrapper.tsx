import React, { FC } from "react";
import { Box } from "@mui/material";
import { NoteTextEditor } from "../../NoteTextEditor";
import { NoteModel } from "../../../../models/note.model"; // Adjust the import to your actual path

type NoteTextEditorWrapperProps = {
  note: NoteModel;
  onSave: (updatedNote: NoteModel) => void;
  onCancel: () => void;
};

const NoteTextEditorWrapper: FC<NoteTextEditorWrapperProps> = ({
  note,
  onSave,
  onCancel,
}) => {
  const handleSaveNoteClick = (value: string) => {
    if (value === "") {
      return;
    }
    onSave({ ...note, content: value });
    onCancel();
  };

  return (
    <Box sx={{ paddingBottom: "10px", height: "150px", marginBottom: "100px" }}>
      <NoteTextEditor
        onSaveNoteClick={handleSaveNoteClick}
        onCancelClick={onCancel}
        text={note.content}
      />
    </Box>
  );
};

export { NoteTextEditorWrapper };
