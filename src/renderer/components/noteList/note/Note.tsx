import React, { useState } from "react";
import { NoteModel } from "../../../../models/note.model";
import { NoteHeader } from "./NoteHeader";
import { NoteContent } from "./NoteContent";

export type NoteProps = {
  note: NoteModel;
  onVideoSeek: (seekTime: number) => void;
  onNoteSave: (note: NoteModel) => void;
  onNoteDelete: (note: NoteModel) => void;
};

const Note = ({ note, onVideoSeek, onNoteSave, onNoteDelete }: NoteProps) => {
  const [edit, setEdit] = useState(false);

  const handleClickChip = () => onVideoSeek(note.videoTimeStamp);

  const toggleEdit = () => setEdit((prevEdit) => !prevEdit);

  return (
    <>
      <NoteHeader
        edit={edit}
        note={note}
        onClickChip={handleClickChip}
        onClickEdit={toggleEdit}
        onClickDelete={() => onNoteDelete(note)}
      />
      <NoteContent
        edit={edit}
        note={note}
        onSave={onNoteSave}
        onCancel={toggleEdit}
      />
    </>
  );
};

export { Note };
