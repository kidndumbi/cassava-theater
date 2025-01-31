import React from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MovieIcon from "@mui/icons-material/Movie";
import ClosedCaptionButton from "../common/ClosedCaptionButton";
import theme from "../../theme";
import { VideoDataModel } from "../../../models/videoData.model";

interface MovieDetailsHeaderProps {
  handleBackClick: () => void;
  handleOpenModal: () => void;
  videoDetails: VideoDataModel | null
  videoPath: string | null;
  updateSubtitle: (filePath: string, options: { filePath: string }) => Promise<void>;
  getVideoDetails: (videoPath: string) => void;
}

const MovieDetailsHeader: React.FC<MovieDetailsHeaderProps> = ({
  handleBackClick,
  handleOpenModal,
  videoDetails,
  videoPath,
  updateSubtitle,
  getVideoDetails,
}) => {

  const handleSubtitleChange = async (filePath: string) => {
    await updateSubtitle(filePath === "None" ? "" : filePath, {
      filePath: videoPath || "",
    });
    getVideoDetails(videoPath!);
  };

  return (
    <Box className="movie-details-header">
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
