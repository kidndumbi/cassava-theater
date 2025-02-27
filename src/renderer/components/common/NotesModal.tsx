import React from "react";
import { Modal, Paper, Box } from "@mui/material";
import theme from "../../theme";
import { AppNotes } from "../AppNotes";
import { VideoDataModel } from "../../../models/videoData.model";

interface NotesModalProps {
  open: boolean;
  handleClose: () => void;
  currentVideoTime: number;
  videoData: VideoDataModel | null;
  handleVideoSeek: (seekTime: number) => void;
}

const NotesModal: React.FC<NotesModalProps> = ({
  open,
  handleClose,
  currentVideoTime,
  videoData,
  handleVideoSeek,
}) => {
  return (
    <Modal open={open} onClose={handleClose}>
      <Paper
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4/5 max-h-[80%] overflow-y-auto p-4"
        sx={{
          bgcolor: theme.customVariables.appDark,
          color: theme.customVariables.appWhiteSmoke,
          boxShadow: 24,
        }}
      >
        <Box className="mx-auto">
          <AppNotes
            handleVideoSeek={handleVideoSeek}
            currentVideoTime={currentVideoTime}
            videoData={videoData}
          />
        </Box>
      </Paper>
    </Modal>
  );
};

export { NotesModal };
