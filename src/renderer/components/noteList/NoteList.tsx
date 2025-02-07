import React from "react";
import Box from "@mui/material/Box";
import { NoteModel } from "../../../models/note.model";
import { useNoteListLogic } from "../../hooks/useNoteListLogic";
import { VideoDataModel } from "../../../models/videoData.model";
import { NoteCreationArea } from "./NoteCreationArea";
import { NoteDisplayArea } from "./NoteDisplayArea";
import { useConfirmation } from "../../contexts/ConfirmationContext";

interface NoteListProps {
  videoData: VideoDataModel | null;
  currentVideoTime: number;
  noteUpdateComplete: () => void;
  noteCreationComplete: () => void;
  handleVideoSeek: (seekTime: number) => void;
}

const NoteList: React.FC<NoteListProps> = ({
  videoData,
  currentVideoTime,
  noteUpdateComplete,
  noteCreationComplete,
  handleVideoSeek,
}) => {
  const {
    showTextEditor,
    handleCreateNote,
    handleDeleteNote,
    handleNoteSave,
    handleCreateNewNoteButtonClick,
    handleCancelClick,
  } = useNoteListLogic();

  const { openDialog, setMessage } = useConfirmation();

  const handleDialogAction = async (message: string, action: () => void) => {
    setMessage(message);
    const dialogDecision = await openDialog();
    if (dialogDecision === "Ok") {
      action();
    }
  };

  const deleteNote = (note: NoteModel) => {
    handleDialogAction(`Are you sure you want to delete note?`, () => {
      handleDeleteNote(
        note,
        videoData?.notes || [],
        videoData,
        noteUpdateComplete
      );
    });
  };

  const handleSaveNote = (note: NoteModel) => {
    handleDialogAction(
      "Are you sure you want to save changes to this note?",
      () => {
        handleNoteSave(
          note,
          videoData?.notes || [],
          videoData,
          noteUpdateComplete
        );
      }
    );
  };

  return (
    <Box>
      <NoteCreationArea
        showTextEditor={showTextEditor}
        handleCreateNote={(content) => {
          handleCreateNote(
            content,
            videoData?.notes || [],
            videoData,
            currentVideoTime,
            noteCreationComplete
          );
        }}
        handleCancelClick={handleCancelClick}
        currentVideoTime={currentVideoTime}
        handleCreateNewNoteButtonClick={handleCreateNewNoteButtonClick}
      />
      <NoteDisplayArea
        notesData={videoData?.notes}
        handleVideoSeek={handleVideoSeek}
        handleNoteSave={handleSaveNote}
        deleteNote={deleteNote}
      />
    </Box>
  );
};

export { NoteList };
