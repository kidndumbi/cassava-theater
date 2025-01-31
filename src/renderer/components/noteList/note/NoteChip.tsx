import React, { FC } from "react";
import { Box, Chip } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
// import Moment from "react-moment";
import { secondsTohhmmss } from "../../../util/helperFunctions";
import { NoteModel } from "../../../../models/note.model"; // Adjust the import to your actual path

type NoteChipProps = {
  note: NoteModel;
  onClick: () => void;
};

const NoteChip: FC<NoteChipProps> = ({ note, onClick }) => {
  const renderTimeStampChip = () => (
    <Chip
      sx={{ marginRight: 1 }}
      label={secondsTohhmmss(note.videoTimeStamp)}
      icon={<AccessTimeIcon />}
      color="secondary"
      variant="filled"
      onClick={onClick}
      size="small"
    />
  );

  const renderCreatedAt = () => (
    <small>
      {note.createdAt ? ( <></>
        // <Moment format="dddd Do MMMM YYYY h:mm A">{note?.createdAt}</Moment>
      ) : null}
    </small>
  );

  return (
    <Box>
      {note.videoTimeStamp > 0 && renderTimeStampChip()}
      {renderCreatedAt()}
    </Box>
  );
};

export { NoteChip };
