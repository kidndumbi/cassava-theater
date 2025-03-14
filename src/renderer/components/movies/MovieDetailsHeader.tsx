import React from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MovieIcon from "@mui/icons-material/Movie";
import ClosedCaptionButton from "../common/ClosedCaptionButton";
import theme from "../../theme";
import { VideoDataModel } from "../../../models/videoData.model";
import WatchLaterIcon from "@mui/icons-material/WatchLater";

interface MovieDetailsHeaderProps {
  handleBackClick: () => void;
  handleOpenModal: () => void;
  videoDetails: VideoDataModel | null;
  videoPath: string | null;
  updateSubtitle: (
    filePath: string,
    options: { filePath: string }
  ) => Promise<void>;
  getVideoDetails: (videoPath: string) => void;
  updateWatchLater: (filePath: string, watchLater: boolean) => void;
}

const MovieDetailsHeader: React.FC<MovieDetailsHeaderProps> = ({
  handleBackClick,
  handleOpenModal,
  videoDetails,
  videoPath,
  updateSubtitle,
  getVideoDetails,
  updateWatchLater,
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
    <Box className="absolute top-[20px] left-[20px] flex justify-between w-[calc(100vw-30px)]">
      <Tooltip title="Back">
        <IconButton
          onClick={handleBackClick}
          style={{
            color: theme.customVariables.appWhite,
          }}
        >
          <ArrowBackIcon />
        </IconButton>
      </Tooltip>

      <Box>
        <ClosedCaptionButton
          showTooltip={true}
          subtitlePath={videoDetails?.subtitlePath || "None"}
          handleFilepathChange={handleSubtitleChange}
        />
        <Tooltip
          title={
            videoDetails?.watchLater
              ? "Remove from Watch Later"
              : "Add to Watch Later"
          }
        >
          <IconButton
            onClick={() => {
              if (videoPath) {
                updateWatchLater(videoPath, !videoDetails?.watchLater);
              }
            }}
            style={{
              color: theme.customVariables.appWhite,
            }}
          >
            <WatchLaterIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="theMovieDb data">
          <IconButton
            onClick={handleOpenModal}
            style={{
              color: theme.customVariables.appWhite,
            }}
          >
            <MovieIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};

export default MovieDetailsHeader;
