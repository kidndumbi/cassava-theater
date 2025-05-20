import React, { useEffect } from "react";
import { Alert, Box, Typography, useTheme } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useTvShows } from "../../hooks/useTvShows";
import useHandlePosterClick from "../../hooks/useHandlePosterClick";
import { useVideoListLogic } from "../../hooks/useVideoListLogic";
import ResumeTvShowLists from "./ResumeTvShowLists";
import ResumeMovieList from "./ResumeMovieList";
import { WatchLaterList } from "./WatchLaterList";
import AppIconButton from "../common/AppIconButton";
import {
  useRecentlyWatchedCustomVideosQuery,
  useRecentlyWatchedVideosQuery,
  useWatchlaterVideosQuery,
} from "../../hooks/useVideoData.query";
import { useGetAllSettings } from "../../hooks/settings/useGetAllSettings";
import { useConfirmation } from "../../contexts/ConfirmationContext";
import WarningIcon from "@mui/icons-material/Warning";
import LoadingIndicator from "../common/LoadingIndicator";

interface HomePageProps {
  style?: React.CSSProperties;
  refreshData: () => void;
  menuId: string;
}

export const HomePage: React.FC<HomePageProps> = ({
  style,
  refreshData,
  menuId,
}) => {
  const theme = useTheme();
  const { setCurrentVideo } = useVideoListLogic();
  const { getSingleEpisodeDetails } = useTvShows();
  const { data: settings } = useGetAllSettings();
  const { openDialog, setMessage } = useConfirmation();

  useEffect(() => {
    console.log("Homepage rendered");
  }, []);

  const { data: resumeMovies, isLoading: loadingResumeMovies } =
    useRecentlyWatchedVideosQuery({
      videoType: "movies",
    });
  const { data: resumeTvShows, isLoading: loadingResumeTvShows } =
    useRecentlyWatchedVideosQuery({
      videoType: "tvShows",
    });

  const { data: resumeCustom, isLoading: isLoadingResumeCustom } =
    useRecentlyWatchedCustomVideosQuery();

  const { data: watchLaterVideos, isLoading: isLoadingWatchLaterVideos } =
    useWatchlaterVideosQuery();

  const { handlePosterClick, loadingItems } = useHandlePosterClick(
    menuId,
    setCurrentVideo,
    getSingleEpisodeDetails,
    settings?.playNonMp4Videos,
    async () => {
      setMessage(
        <Alert icon={<WarningIcon fontSize="inherit" />} severity="warning">
          "Playback of non-MP4 videos is currently disabled in settings. To play
          this video, please enable playback of non-MP4 videos in the settings."
        </Alert>,
      );
      await openDialog(undefined, true);
    },
  );

  const title = (value: string) => (
    <Typography
      variant="h6"
      gutterBottom
      sx={{
        color: theme.customVariables.appWhiteSmoke,
        fontWeight: "bold",
      }}
    >
      {value}
    </Typography>
  );

  return (
    <Box
      className="custom-scrollbar"
      style={{ ...style, overflowY: "auto", paddingTop: "20px" }}
    >
      <AppIconButton
        tooltip="Refresh"
        onClick={refreshData}
        disabled={loadingResumeMovies && loadingResumeTvShows}
      >
        <RefreshIcon />
      </AppIconButton>

      {title("Resume")}
      <Box>
        <ResumeMovieList
          loadingMovies={loadingResumeMovies}
          sortedMovies={resumeMovies}
          handlePosterClick={handlePosterClick}
        />
      </Box>
      <Box sx={{ marginTop: "20px" }}>
        <ResumeTvShowLists
          loadingTvShows={loadingResumeTvShows}
          sortedTvShows={resumeTvShows}
          handlePosterClick={handlePosterClick}
          loadingItems={loadingItems}
        />
      </Box>

      {/* Resume Custom Videos */}
      <Box sx={{ marginTop: "20px" }}>
        {title("Resume Custom Folders")}
        {isLoadingResumeCustom ? (
          <LoadingIndicator message="Loading custom videos..." />
        ) : (
          resumeCustom?.map((custom) =>
            custom?.videos?.length > 0 ? (
              <Box key={custom.folder.id} sx={{ marginBottom: "20px" }}>
                <Typography variant="subtitle1" sx={{ mb: 1 }}>
                  {custom.folder.name}
                </Typography>
                <ResumeMovieList
                  loadingMovies={false}
                  sortedMovies={custom.videos}
                  handlePosterClick={handlePosterClick}
                />
              </Box>
            ) : null,
          )
        )}
      </Box>

      <Box sx={{ marginTop: "20px" }}>{title("Watch Later")}</Box>
      <Box>
        <WatchLaterList
          handlePosterClick={handlePosterClick}
          watchLaterVideos={watchLaterVideos}
          loadingWatchLater={isLoadingWatchLaterVideos}
        />
      </Box>
    </Box>
  );
};
