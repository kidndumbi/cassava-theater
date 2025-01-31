import React from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { Paper } from "@mui/material";
import { secondsTohhmmss } from "../../util/helperFunctions";
import { NoteTextEditor } from "../NoteTextEditor";
import CreateNewNote from "./CreateNewNote";
import theme from "../../theme";

interface NoteCreationAreaProps {
  showTextEditor: boolean;
  handleCreateNote: (content: string) => void;
  handleCancelClick: () => void;
  currentVideoTime: number;
  handleCreateNewNoteButtonClick: () => void;
}

const NoteCreationArea: React.FC<NoteCreationAreaProps> = ({
  showTextEditor,
  handleCreateNote,
  handleCancelClick,
  currentVideoTime,
  handleCreateNewNoteButtonClick,
}) => {
  const renderNoteEditor = () => (
    <Paper
      sx={{
        padding: 1,
        marginBottom: 1,
        backgroundColor: theme.customVariables.appDark,
      }}
    >
      <Box sx={{ height: "320px" }}>
        <Box
          sx={{
            marginBottom: 1,
            color: theme.customVariables.appWhiteSmoke,
          }}
        >
          New note
          {currentVideoTime > 0 && (
            <>
              {" at:"}
              <Chip
                label={secondsTohhmmss(currentVideoTime)}
                icon={<AccessTimeIcon />}
                color="secondary"
                variant="filled"
                size="small"
              />
            </>
          )}
        </Box>
        <NoteTextEditor
          onSaveNoteClick={handleCreateNote}
          onCancelClick={handleCancelClick}
          btnText="Save New Note"
          height="200px"
        />
      </Box>
    </Paper>
  );

  return (
    <Box>
      {showTextEditor ? (
        renderNoteEditor()
      ) : (
        <CreateNewNote
          currentVideoTime={currentVideoTime}
          onButtonClick={handleCreateNewNoteButtonClick}
        />
      )}
    </Box>
  );
};

export { NoteCreationArea };
