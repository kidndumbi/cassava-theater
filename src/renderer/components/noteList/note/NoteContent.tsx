import React, { FC } from "react";
import { Box } from "@mui/material";
import { NoteModel } from "../../../../models/note.model"; // Adjust the import to your actual path
import { NoteTextEditorWrapper } from "./NoteTextEditorWrapper";
import theme from "../../../theme";

type NoteContentProps = {
  edit: boolean;
  note: NoteModel;
  onSave: (updatedNote: NoteModel) => void;
  onCancel: () => void;
};

const NoteContent: FC<NoteContentProps> = ({
  edit,
  note,
  onSave,
  onCancel,
}) => {
  return edit ? (
    <NoteTextEditorWrapper note={note} onSave={onSave} onCancel={onCancel} />
  ) : (
    <Box
      sx={{
        width: "100%",
        padding: "20px",
        backgroundColor: theme.customVariables.appDarker,
        marginTop: "5px",
        marginBottom: "5px",
        borderRadius: "5px",
        color: theme.customVariables.appWhiteSmoke,
      }}
    >
      <Box dangerouslySetInnerHTML={{ __html: note.content }}></Box>
    </Box>
  );
};

export { NoteContent };
