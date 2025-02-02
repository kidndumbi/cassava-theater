import React, { useState, useEffect } from "react";
import { useQuill } from "react-quilljs";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import theme from "../theme";

import "quill/dist/quill.snow.css";

type EditorProps = {
  value: string;
  onChange: (value: string) => void;
};

const Editor = ({ value, onChange }: EditorProps) => {
  const { quill, quillRef } = useQuill();

  useEffect(() => {
    if (quill) {
      quill.clipboard.dangerouslyPasteHTML(value);

      const handleTextChange = () => {
        onChange(quill.root.innerHTML);
      };

      quill.on("text-change", handleTextChange);
      return () => {
        quill.off("text-change", handleTextChange);
      };
    }
  }, [quill]);

  return (
    <div
      ref={quillRef}
      style={{
        backgroundColor: theme.customVariables.appDark,
        color: theme.customVariables.appWhiteSmoke,
      }}
    />
  );
};

type EditorActionsProps = {
  onCancel: () => void;
  onSave: () => void;
  saveBtnText: string;
};

const EditorActions = ({
  onCancel,
  onSave,
  saveBtnText,
}: EditorActionsProps) => (
  <Box sx={{ marginTop: "5px" }}>
    <Button size="small" onClick={onCancel} variant="text">
      Cancel
    </Button>
    <Button size="small" onClick={onSave} variant="contained">
      {saveBtnText}
    </Button>
  </Box>
);

type NoteTextEditorProps = {
  onCancelClick: () => void;
  onSaveNoteClick: (value: string) => void;
  text?: string;
  btnText?: string;
  height?: string;
};

const NoteTextEditor = ({
  onCancelClick,
  onSaveNoteClick,
  text = "",
  btnText = "Save Note",
  height,
}: NoteTextEditorProps) => {
  const [value, setValue] = useState(text);

  return (
    <Box sx={{ height }}>
      <Box>
        <Editor value={value} onChange={setValue} />
      </Box>
      <EditorActions
        onCancel={onCancelClick}
        onSave={() => onSaveNoteClick(value)}
        saveBtnText={btnText}
      />
    </Box>
  );
};

export { NoteTextEditor };
