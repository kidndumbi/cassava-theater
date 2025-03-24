import React from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { Clear, SkipNext } from "@mui/icons-material";
import theme from "../../theme";
import RecentActorsIcon from "@mui/icons-material/RecentActors";
import NotesIcon from "@mui/icons-material/Notes";
import AppIconButton from "../common/AppIconButton";
import { VideoDataModel } from "../../../models/videoData.model";
import { removeVidExt } from "../../util/helperFunctions";

type SideControlsOverlayProps = {
  handleCancel: (filePath: string) => void;
  filePath?: string;
  handleNext?: () => void;
  handleOpenNotesModal: () => void;
  nextEpisode?: VideoDataModel;
  toggleCastAndCrew?: () => void;
};

const SideControlsOverlay: React.FC<SideControlsOverlayProps> = ({
  handleCancel,
  filePath,
  handleNext,
  handleOpenNotesModal,
  nextEpisode,
  toggleCastAndCrew,
}) => {
  const handleCancelClick = () => {
    handleCancel(filePath || "");
  };

  return (
    <Box
      style={{
        position: "absolute",
        top: "20px",
        right: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "5px",
      }}
    >
      <IconButton
        sx={{ color: theme.customVariables.appWhite }}
        onClick={handleCancelClick}
      >
        <Clear />
      </IconButton>
      {handleNext && (
        <AppIconButton
          tooltip={removeVidExt(nextEpisode.fileName)}
          onClick={handleNext}
        >
          <SkipNext />
        </AppIconButton>
      )}
      <AppIconButton
        sx={{ left: 0 }}
        tooltip="Notes"
        onClick={handleOpenNotesModal}
      >
        <NotesIcon />
      </AppIconButton>

      {toggleCastAndCrew && (
        <AppIconButton tooltip="Cast & Crew" onClick={toggleCastAndCrew}>
          <RecentActorsIcon />
        </AppIconButton>
      )}
    </Box>
  );
};

export default SideControlsOverlay;
