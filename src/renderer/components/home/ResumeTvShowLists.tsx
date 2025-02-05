import React from "react";
import {
  Box,
  CircularProgress,
  Divider,
  Typography,
  useTheme,
} from "@mui/material";
import { VideoDataModel } from "../../../models/videoData.model";
import { useTmdbImageUrl } from "../../hooks/useImageUrl";
import { trimFileName } from "../../util/helperFunctions";
import { VideoProgressBar } from "../common/VideoProgressBar";
import LoadingIndicator from "../common/LoadingIndicator";
import { PosterCard } from "../common/PosterCard"; // new import

interface ResumeTvShowListsProps {
  sortedTvShows: VideoDataModel[];
  handlePosterClick: (videoType: string, video: VideoDataModel) => void;
  loadingItems: { [key: string]: boolean };
  loadingTvShows: boolean;
}

const ResumeTvShowLists: React.FC<ResumeTvShowListsProps> = ({
  sortedTvShows,
  handlePosterClick,
  loadingItems,
  loadingTvShows,
}) => {
  const theme = useTheme();
  const { getTmdbImageUrl, defaultImageUrl } = useTmdbImageUrl();

  const renderTvShow = (tvShow: VideoDataModel) => (
    <Box key={tvShow.filePath} sx={{ position: "relative", maxWidth: "200px" }}>
      <PosterCard
        imageUrl={
          tvShow?.tv_show_details?.poster_path
            ? getTmdbImageUrl(tvShow.tv_show_details.poster_path)
            : defaultImageUrl
        }
        fallbackUrl={defaultImageUrl}
        altText={tvShow.fileName}
        onClick={() => handlePosterClick("tvShow", tvShow)}
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
              {trimFileName(tvShow.fileName!)}/
              {tvShow.lastVideoPlayed
                ?.split("/")
                .pop()
                ?.replace(/\.(mp4|mkv)$/i, "")}
            </Typography>
          </Box>
        }
      />
      {loadingItems[tvShow.filePath!] && (
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
    </Box>
  );

  return (
    <Box>
      <Typography
        variant="h6"
        gutterBottom
        sx={{
          color: theme.customVariables.appWhiteSmoke,
          fontWeight: "bold",
        }}
      >
        Resume watching These TV Shows
      </Typography>
      <Divider
        sx={{
          marginY: 2,
          borderColor: theme.palette.primary.main,
          marginRight: 2,
        }}
      />
      <Box
        display="flex"
        gap="8px"
        sx={{ maxWidth: "calc(100vw - 30px)", overflowY: "auto" }}
      >
        {loadingTvShows ? (
          <LoadingIndicator message="Loading TV shows..." />
        ) : sortedTvShows.length === 0 ? (
          <Box
            display="flex"
            justifyContent="center"
            paddingTop="2rem"
            paddingBottom="2rem"
          >
            <Box fontSize="2rem">No TV Shows to display</Box>
          </Box>
        ) : (
          sortedTvShows.map(renderTvShow)
        )}
      </Box>
    </Box>
  );
};

export default ResumeTvShowLists;
