import React from "react";
import Box from "@mui/material/Box";
import { Paper } from "@mui/material";
import { NoteModel } from "../../../models/note.model";
import { Note } from "./note/Note";
import theme from "../../theme";

interface NoteDisplayAreaProps {
  notesData?: NoteModel[];
  handleVideoSeek: (time: number) => void;
  handleNoteSave: (note: NoteModel) => void;
  deleteNote: (note: NoteModel) => void;
}

const NoteDisplayArea: React.FC<NoteDisplayAreaProps> = ({
  notesData,
  handleVideoSeek,
  handleNoteSave,
  deleteNote,
}) => {
  return (
    <Box sx={{ height: "100%" }}>
      {notesData?.map((note) => (
        <NotePaper
          key={note.id}
          note={note}
          handleVideoSeek={handleVideoSeek}
          handleNoteSave={handleNoteSave}
          deleteNote={deleteNote}
        />
      ))}
    </Box>
  );
};

interface NotePaperProps {
  note: NoteModel;
  handleVideoSeek: (time: number) => void;
  handleNoteSave: (note: NoteModel) => void;
  deleteNote: (note: NoteModel) => void;
}

const NotePaper: React.FC<NotePaperProps> = ({
  note,
  handleVideoSeek,
  handleNoteSave,
  deleteNote,
}) => (
  <Paper
    sx={{
      padding: 1,
      marginBottom: 1,
      backgroundColor: theme.customVariables.appDark,
      color: theme.customVariables.appWhiteSmoke,
    }}
  >
    <Note
      note={note}
      onVideoSeek={handleVideoSeek}
      onNoteSave={handleNoteSave}
      onNoteDelete={deleteNote}
    />
  </Paper>
);

export { NoteDisplayArea };
