import React from "react";
import { Modal, Paper, Box } from "@mui/material";
import theme from "../../theme";
import { AppNotes } from "../AppNotes";
import { VideoDataModel } from "../../../models/videoData.model";
import styles from "./NotesModal.module.css";

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
      <Paper className={styles.notesModalPaper}
        sx={{
          bgcolor: theme.customVariables.appDark,
          color: theme.customVariables.appWhiteSmoke,
          boxShadow: 24,
        }}
      >
        <Box className={styles.notesModalBox}>
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
