import React from "react";
import Box from "@mui/material/Box";
import { Clear, SkipNext } from "@mui/icons-material";
import RecentActorsIcon from "@mui/icons-material/RecentActors";
import NotesIcon from "@mui/icons-material/Notes";
import AppIconButton from "../common/AppIconButton";
import { VideoDataModel } from "../../../models/videoData.model";
import { removeVidExt } from "../../util/helperFunctions";
import FeaturedPlayListIcon from "@mui/icons-material/FeaturedPlayList";

interface ControlButton {
  icon: React.ReactNode;
  tooltip: string;
  onClick: () => void;
  sx?: React.ComponentProps<typeof AppIconButton>["sx"];
  show?: boolean;
}

type SideControlsOverlayProps = {
  handleCancel: (filePath: string) => void;
  filePath?: string;
  handleNext?: () => void;
  handleOpenNotesModal: () => void;
  nextEpisode?: VideoDataModel;
  toggleCastAndCrew?: () => void;
  togglePlaylistControl?: () => void;
};

const SideControlsOverlay: React.FC<SideControlsOverlayProps> = ({
  handleCancel,
  filePath = "",
  handleNext,
  handleOpenNotesModal,
  nextEpisode,
  toggleCastAndCrew,
  togglePlaylistControl,
}) => {
  const handleCancelClick = () => handleCancel(filePath);

  const controlButtons: ControlButton[] = [
    {
      icon: <Clear />,
      tooltip: "Close",
      onClick: handleCancelClick,
    },
    {
      icon: <SkipNext />,
      tooltip: nextEpisode ? removeVidExt(nextEpisode.fileName) : "Next",
      onClick: handleNext,
      show: !!handleNext,
    },
    {
      icon: <NotesIcon />,
      tooltip: "Notes",
      onClick: handleOpenNotesModal,
      sx: { left: 0 },
    },
    {
      icon: <RecentActorsIcon />,
      tooltip: "Cast & Crew",
      onClick: toggleCastAndCrew,
      show: !!toggleCastAndCrew,
    },
    {
      icon: <FeaturedPlayListIcon />,
      tooltip: "Playlist controls",
      onClick: togglePlaylistControl,
      show: !!togglePlaylistControl,
    },
  ];

  return (
    <Box className="absolute right-5 top-5 flex flex-col gap-1.5">
      {controlButtons.map(
        (button, index) =>
          (button.show === undefined || button.show) && (
            <AppIconButton
              key={index}
              tooltip={button.tooltip}
              onClick={button.onClick}
              sx={button.sx}
            >
              {button.icon}
            </AppIconButton>
          ),
      )}
    </Box>
  );
};

export default SideControlsOverlay;
