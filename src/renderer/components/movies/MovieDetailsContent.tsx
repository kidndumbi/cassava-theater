import React, { useState } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import { getYearFromDate, removeVidExt } from "../../util/helperFunctions";
import { a11yProps } from "../common/TabPanel";
import MovieDetailsButtons from "./MovieDetailsButtons";
import { VideoDataModel } from "../../../models/videoData.model";
import { VideoProgressBar } from "../common/VideoProgressBar";

interface MovieDetailsContentProps {
  videoDetails: VideoDataModel | null;
  handlePlay: (startFromBeginning?: boolean) => void;
  currentTabValue: number;
  onTabChange: (event: React.SyntheticEvent, newValue: number) => void;
}

const MovieDetailsContent: React.FC<MovieDetailsContentProps> = ({
  videoDetails,
  handlePlay,
  currentTabValue,
  onTabChange,
}) => {
  const [hasError, setHasError] = useState(false);

  const title =
    videoDetails?.movie_details?.title || removeVidExt(videoDetails?.fileName);
  const releaseYear = videoDetails?.movie_details?.release_date
    ? `(${getYearFromDate(videoDetails.movie_details.release_date)})`
    : "";
  const hasProgress = videoDetails?.currentTime > 0;
  const showProgressScreenshot =
    hasProgress && videoDetails?.videoProgressScreenshot && !hasError;

  const handleImageError = () => {
    setHasError(true);
  };

  return (
    <Box className="absolute bottom-5 left-5 w-full text-white drop-shadow-md">
      <h2 className="mb-4 text-4xl font-extrabold">
        {title}
        {releaseYear}
      </h2>
      <p className="max-w-[50%]">{videoDetails?.movie_details?.overview}</p>

      <MovieDetailsButtons
        videoDetails={videoDetails}
        handlePlay={handlePlay}
      />

      {showProgressScreenshot && (
        <>
          <img
            src={videoDetails.videoProgressScreenshot}
            alt={videoDetails.fileName}
            className="m-0 mb-4 h-[200px] w-[300px] rounded-lg"
            onError={handleImageError}
          />
          <Box className="pr-5">
            <VideoProgressBar
              current={videoDetails.currentTime}
              total={videoDetails.duration || 0}
            />
          </Box>
        </>
      )}

      <Box>
        <Tabs
          value={currentTabValue}
          onChange={onTabChange}
          aria-label="basic tabs example"
        >
          <Tab label="Notes" {...a11yProps(0)} />
        </Tabs>
      </Box>
    </Box>
  );
};

export default MovieDetailsContent;
