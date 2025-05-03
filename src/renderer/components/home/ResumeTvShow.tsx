import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { VideoDataModel } from "../../../models/videoData.model";
import { getUrl, removeVidExt, trimFileName } from "../../util/helperFunctions";
import { VideoProgressBar } from "../common/VideoProgressBar";
import { PosterCard } from "../common/PosterCard";
import TvShowDetailsButtons from "../tv-shows/TvShowDetailsButtons";
import { useConfirmation } from "../../contexts/ConfirmationContext";
import { useGetAllSettings } from "../../hooks/settings/useGetAllSettings";

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
  const { data: settings } = useGetAllSettings();
  const { openDialog, setMessage } = useConfirmation();

  const imageUrl = React.useMemo(() => {
    if (tvShow.poster) {
      return getUrl("file", tvShow.poster, null, settings?.port);
    }
    if (tvShow?.tv_show_details?.poster_path) {
      return getTmdbImageUrl(tvShow.tv_show_details.poster_path);
    }
    return undefined;
  }, [
    tvShow.poster,
    tvShow.tv_show_details?.poster_path,
    settings?.port,
    getTmdbImageUrl,
  ]);

  const handlePlay = async (startFromBeginning = false) => {
    if (startFromBeginning) {
      setMessage(
        "Are you sure you want to start the movie from the beginning?",
      );
      const dialogDecision = await openDialog();
      if (dialogDecision === "Ok") {
        handlePosterClick("tvShow", tvShow, startFromBeginning);
      }
      return;
    }
    handlePosterClick("tvShow", tvShow, startFromBeginning);
  };

  const footerContent = (
    <Box className="mt-2">
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
        {removeVidExt(tvShow.lastVideoPlayed?.split("/").pop())}
      </Typography>
    </Box>
  );

  const actionButtons = showActionButtons && (
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
  );

  const loadingOverlay = loadingItems[tvShow.filePath] && (
    <Box className="absolute left-0 top-0 flex h-full w-full items-center justify-center bg-[rgba(0,0,0,0.5)]">
      <CircularProgress />
    </Box>
  );

  return (
    <Box
      key={tvShow.filePath}
      className="relative max-w-[200px]"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <PosterCard
        imageUrl={imageUrl}
        altText={tvShow.fileName}
        footer={footerContent}
      />
      {loadingOverlay}
      {actionButtons}
    </Box>
  );
};

export default ResumeTvShow;