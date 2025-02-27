import React from "react";
import styles from "./MovieDetailsContent.module.css"; // switched to module.css
import { Box, Tabs, Tab } from "@mui/material";
import { getYearFromDate } from "../../util/helperFunctions";

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
  return (
    <div className={styles.movieDetailsContent}>
      <h1>
        {videoDetails?.movie_details?.title ||
          videoDetails?.fileName?.replace(/\.(mp4|mkv|avi)$/i, "")}
        {videoDetails?.movie_details?.release_date &&
          "(" +
            getYearFromDate(videoDetails?.movie_details?.release_date) +
            ")"}
      </h1>
      <p style={{ maxWidth: "50%" }}>{videoDetails?.movie_details?.overview}</p>
      <MovieDetailsButtons
        videoDetails={videoDetails}
        handlePlay={handlePlay}
      />
      {videoDetails?.currentTime !== undefined &&
        videoDetails?.currentTime > 0 && (
          <Box sx={{ paddingRight: "20px" }}>
            <VideoProgressBar
              current={videoDetails?.currentTime || 0}
              total={videoDetails?.duration || 0}
            />
          </Box>
        )}

      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={currentTabValue}
          onChange={onTabChange}
          aria-label="basic tabs example"
        >
          <Tab label="Notes" {...a11yProps(0)} />
        </Tabs>
      </Box>
    </div>
  );
};

export default MovieDetailsContent;
