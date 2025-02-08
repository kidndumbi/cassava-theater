import React from "react";
import { Box, Button } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import "./MovieDetailsButtons.css";

interface MovieDetailsButtonsProps {
  videoDetails: any;
  handlePlay: (startFromBeginning?: boolean) => void;
  resumeText?: string;
  playText?: string;
  startFromBeginningText?: string;
}

const MovieDetailsButtons: React.FC<MovieDetailsButtonsProps> = ({
  videoDetails,
  handlePlay,
  resumeText = "Resume",
  playText = "Play",
  startFromBeginningText = "Start from beginning",
}) => {
  return (
    <Box className="movie-details-buttons">
      {videoDetails?.currentTime === 0 ? (
        <Button
          variant="contained"
          color="primary"
          onClick={() => handlePlay()}
        >
            <PlayArrowIcon></PlayArrowIcon>
          {playText}
        </Button>
      ) : (
        <>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => handlePlay()}
          >
            <PlayArrowIcon></PlayArrowIcon>
            {resumeText}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handlePlay(true)}
          >
            <RefreshIcon></RefreshIcon>
            {startFromBeginningText}
          </Button>
        </>
      )}
    </Box>
  );
};

export default MovieDetailsButtons;
