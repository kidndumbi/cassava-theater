import React, { useState, FC, useEffect } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import { NoteTextEditor } from "../NoteTextEditor";
import theme from "../../theme";
import { VideoDataModel } from "../../../models/videoData.model";
import { useNoteListLogic } from "../../hooks/useNoteListLogic";

type EditButtonProps = {
  onClick: () => void;
};

const EditButton: FC<EditButtonProps> = ({ onClick }) => (
  <IconButton
    color="secondary"
    aria-label="edit"
    size="large"
    onClick={onClick}
  >
    <EditIcon fontSize="inherit" />
  </IconButton>
);

type TextDisplayProps = {
  body: string;
};

const TextDisplay: FC<TextDisplayProps> = ({ body }) => (
  <Box
    dangerouslySetInnerHTML={{ __html: body || "" }}
    sx={{ color: theme.customVariables.appWhiteSmoke }}
  ></Box>
);

type TextEditorProps = {
  onSave: (value: string) => void;
  onCancel: () => void;
  body: string;
};

const TextEditor: FC<TextEditorProps> = ({ onSave, onCancel, body }) => (
  <Box sx={{ height: 250, mb: 5 }}>
    <NoteTextEditor
      onSaveNoteClick={onSave}
      onCancelClick={onCancel}
      btnText="Save"
      text={body}
    />
  </Box>
);

type OverviewProps = {
  videoData: VideoDataModel;
  updateComplete: () => void;
};

const Overview: FC<OverviewProps> = ({ videoData, updateComplete }) => {
  const [showTextEditor, setShowTextEditor] = useState(false);

  const { updateOverview } = useNoteListLogic();

  const save = (body: string) => {
    if (!body) return;

    updateOverview(body, videoData, () => {
      setShowTextEditor(false);
      updateComplete();
    });
  };

  return (
    <Box>
      {!showTextEditor && (
        <EditButton onClick={() => setShowTextEditor(true)} />
      )}
      <Box sx={{ marginBottom: 1 }}>
        {!showTextEditor ? (
          <TextDisplay body={videoData?.overview?.body || ""} />
        ) : (
          <TextEditor
            onSave={(value) => {
              setShowTextEditor(false);
              save(value);
            }}
            onCancel={() => setShowTextEditor(false)}
            body={videoData?.overview?.body || ""}
          />
        )}
      </Box>
    </Box>
  );
};

export { Overview };
