import React from "react";
import { Button } from "@mui/material";
import "./MovieDetailsButtons.css";

interface MovieDetailsButtonsProps {
  videoDetails: any;
  handlePlay: (startFromBeginning?: boolean) => void;
}

const MovieDetailsButtons: React.FC<MovieDetailsButtonsProps> = ({
  videoDetails,
  handlePlay,
}) => {
  return (
    <div className="movie-details-buttons">
      {videoDetails?.currentTime === 0 ? (
        <Button variant="contained" color="primary" onClick={() => handlePlay()}>
          Play
        </Button>
      ) : (
        <>
          <Button variant="contained" color="secondary" onClick={() => handlePlay()}>
            Continue
          </Button>
          <Button variant="contained" color="primary" onClick={() => handlePlay(true)}>
            Start from beginning
          </Button>
        </>
      )}
    </div>
  );
};

export default MovieDetailsButtons;
