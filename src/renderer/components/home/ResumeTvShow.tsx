import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { VideoDataModel } from "../../../models/videoData.model";
import { trimFileName } from "../../util/helperFunctions";
import { VideoProgressBar } from "../common/VideoProgressBar";
import { PosterCard } from "../common/PosterCard";
import TvShowDetailsButtons from "../tv-shows/TvShowDetailsButtons";

interface ResumeTvShowProps {
  tvShow: VideoDataModel;
  handlePosterClick: (
    videoType: string,
    video: VideoDataModel,
    startFromBeginning: boolean
  ) => void;
  getTmdbImageUrl: (path: string) => string;
  defaultImageUrl: string;
  loadingItems: { [key: string]: boolean };
}

const ResumeTvShow: React.FC<ResumeTvShowProps> = ({
  tvShow,
  handlePosterClick,
  getTmdbImageUrl,
  defaultImageUrl,
  loadingItems,
}) => {
  const [showActionButtons, setShowActions] = React.useState(false);

  const handlePlay = (startFromBeginning = false) => {
    handlePosterClick("tvShow", tvShow, startFromBeginning);
  };

  return (
    <Box
      key={tvShow.filePath}
      sx={{ position: "relative", maxWidth: "200px" }}
      onMouseEnter={() => {
        setShowActions(true);
      }}
      onMouseLeave={() => {
        setShowActions(false);
      }}
    >
      <PosterCard
        imageUrl={
          tvShow?.tv_show_details?.poster_path
            ? getTmdbImageUrl(tvShow.tv_show_details.poster_path)
            : defaultImageUrl
        }
        altText={tvShow.fileName}
        footer={
          <Box sx={{ marginTop: "5px" }}>
            <VideoProgressBar
              current={tvShow.lastVideoPlayedTime || 0}
              total={tvShow.lastVideoPlayedDuration || 0}
            />
            <Typography
              variant="subtitle1"
              align="center"
              sx={{ wordBreak: "break-all" }}
            >
              {trimFileName(tvShow.fileName ?? "Unknown")}/
              {tvShow.lastVideoPlayed
                ?.split("/")
                .pop()
                ?.replace(/\.(mp4|mkv)$/i, "")}
            </Typography>
          </Box>
        }
      />
      {loadingItems[tvShow.filePath] && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <CircularProgress />
        </Box>
      )}
      {showActionButtons && (
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <TvShowDetailsButtons
            playText=""
            resumeText=""
            startFromBeginningText=""
            tvShowDetails={tvShow}
            onContinueClick={() => handlePlay(false)}
            onStartFromBeginningClick={() => handlePlay(true)}
          />
        </Box>
      )}
    </Box>
  );
};

export default ResumeTvShow;
