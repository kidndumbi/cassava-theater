import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { VideoDataModel } from "../../../models/videoData.model";
import { getUrl, trimFileName } from "../../util/helperFunctions";
import { VideoProgressBar } from "../common/VideoProgressBar";
import { PosterCard } from "../common/PosterCard";
import TvShowDetailsButtons from "../tv-shows/TvShowDetailsButtons";
import { useSettings } from "../../hooks/useSettings";

interface ResumeTvShowProps {
  tvShow: VideoDataModel;
  handlePosterClick: (
    videoType: string,
    video: VideoDataModel,
    startFromBeginning: boolean,
  ) => void;
  getTmdbImageUrl: (path: string) => string;
  loadingItems: { [key: string]: boolean };
}

const ResumeTvShow: React.FC<ResumeTvShowProps> = ({
  tvShow,
  handlePosterClick,
  getTmdbImageUrl,
  loadingItems,
}) => {
  const [showActionButtons, setShowActions] = React.useState(false);
  const { settings } = useSettings();

  const getImageUlr = () => {
    if (tvShow.poster) {
      return getUrl("file", tvShow.poster, null, settings?.port);
    }
    if (tvShow?.tv_show_details?.poster_path) {
      return getTmdbImageUrl(tvShow.tv_show_details.poster_path);
    }
  };

  const handlePlay = (startFromBeginning = false) => {
    handlePosterClick("tvShow", tvShow, startFromBeginning);
  };

  return (
    <Box
      key={tvShow.filePath}
      className="relative max-w-[200px]"
      onMouseEnter={() => {
        setShowActions(true);
      }}
      onMouseLeave={() => {
        setShowActions(false);
      }}
    >
      <PosterCard
        imageUrl={getImageUlr()}
        altText={tvShow.fileName}
        footer={
          <Box className="mt-[5px]">
            <VideoProgressBar
              current={tvShow.lastVideoPlayedTime || 0}
              total={tvShow.lastVideoPlayedDuration || 0}
            />
            <Typography
              variant="subtitle1"
              align="center"
              className="w-full whitespace-normal break-all text-center"
            >
              {trimFileName(tvShow.fileName ?? "Unknown")}/
              {tvShow.lastVideoPlayed
                ?.split("/")
                .pop()
                ?.replace(/\.(mp4|mkv|avi)$/i, "")}
            </Typography>
          </Box>
        }
      />
      {loadingItems[tvShow.filePath] && (
        <Box className="absolute left-0 top-0 flex h-full w-full items-center justify-center bg-[rgba(0,0,0,0.5)]">
          <CircularProgress />
        </Box>
      )}
      {showActionButtons && (
        <Box className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
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
