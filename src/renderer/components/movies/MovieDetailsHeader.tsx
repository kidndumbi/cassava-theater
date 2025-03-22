import React from "react";
import { Box } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MovieIcon from "@mui/icons-material/Movie";
import ClosedCaptionButton from "../common/ClosedCaptionButton";
import { VideoDataModel } from "../../../models/videoData.model";
import WatchLaterIcon from "@mui/icons-material/WatchLater";
import RefreshIcon from "@mui/icons-material/Refresh";
import AppIconButton from "../common/AppIconButton";

interface MovieDetailsHeaderProps {
  handleBackClick: () => void;
  handleOpenModal: () => void;
  videoDetails: VideoDataModel | null;
  videoPath: string | null;
  updateSubtitle: (
    filePath: string,
    options: { filePath: string },
  ) => Promise<void>;
  getVideoDetails: (videoPath: string) => void;
  updateWatchLater: (filePath: string, watchLater: boolean) => void;
  onRefresh: () => void;
}

const MovieDetailsHeader: React.FC<MovieDetailsHeaderProps> = ({
  handleBackClick,
  handleOpenModal,
  videoDetails,
  videoPath,
  updateSubtitle,
  getVideoDetails,
  updateWatchLater,
  onRefresh,
}) => {
  const handleSubtitleChange = async (filePath: string) => {
    await updateSubtitle(filePath === "None" ? "" : filePath, {
      filePath: videoPath || "",
    });
    if (videoPath) {
      getVideoDetails(videoPath);
    }
  };

  return (
    <Box className="absolute left-[20px] top-[20px] flex w-[calc(100vw-40px)] justify-between">
      <AppIconButton tooltip="Back" onClick={handleBackClick}>
        <ArrowBackIcon />
      </AppIconButton>

      <Box>
        <ClosedCaptionButton
          showTooltip={true}
          subtitlePath={videoDetails?.subtitlePath || "None"}
          handleFilepathChange={handleSubtitleChange}
        />
        <AppIconButton tooltip="Refresh" onClick={onRefresh}>
          <RefreshIcon />
        </AppIconButton>
        <AppIconButton
          tooltip={
            videoDetails?.watchLater
              ? "Remove from Watch Later"
              : "Add to Watch Later"
          }
          onClick={() => {
            if (videoPath) {
              updateWatchLater(videoPath, !videoDetails?.watchLater);
            }
          }}
        >
          <WatchLaterIcon />
        </AppIconButton>
        <AppIconButton tooltip="theMovieDb data" onClick={handleOpenModal}>
          <MovieIcon />
        </AppIconButton>
      </Box>
    </Box>
  );
};

export default MovieDetailsHeader;
