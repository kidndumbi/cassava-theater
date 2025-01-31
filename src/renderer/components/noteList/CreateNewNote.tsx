// CreateNewNote.tsx
import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { secondsTohhmmss } from "../../../util/helperFunctions";

interface CreateNewNoteProps {
  currentVideoTime: number;
  onButtonClick: () => void;
}

const CreateNewNote: React.FC<CreateNewNoteProps> = ({
  currentVideoTime,
  onButtonClick,
}) => {
  const renderButtonText = () => {
    if (currentVideoTime > 0) {
      return `Create new note at ${secondsTohhmmss(currentVideoTime)}`;
    }
    return "Create new note";
  };

  return (
    <Box sx={{ marginBottom: "15px" }}>
      <Button color="primary" variant="contained" onClick={onButtonClick}>
        {renderButtonText()}
      </Button>
    </Box>
  );
};

export default CreateNewNote;
