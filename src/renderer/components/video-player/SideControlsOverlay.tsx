import React from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { Clear, SkipNext } from "@mui/icons-material";
import theme from "../../theme";
import { Tooltip } from "@mui/material";
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
};

const SideControlsOverlay: React.FC<SideControlsOverlayProps> = ({
  handleCancel,
  filePath,
  handleNext,
  handleOpenNotesModal,
  nextEpisode,
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
        // <IconButton
        //   sx={{ color: theme.customVariables.appWhite }}
        //   onClick={handleNext}
        // >
        //   <SkipNext />
        // </IconButton>

        <AppIconButton
          tooltip={removeVidExt(nextEpisode.fileName)}
          onClick={handleNext}
        >
          <SkipNext />
        </AppIconButton>
      )}
      <Tooltip title="Notes">
        <IconButton
          sx={{
            left: 0,
            color: theme.customVariables.appWhiteSmoke,
            width: 48,
            height: 48,
          }}
          onClick={handleOpenNotesModal}
        >
          <NotesIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default SideControlsOverlay;
