import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useTvShows } from "../../hooks/useTvShows";
import useHandlePosterClick from "../../hooks/useHandlePosterClick";
import { useVideoListLogic } from "../../hooks/useVideoListLogic";
import ResumeTvShowLists from "./ResumeTvShowLists";
import ResumeMovieList from "./ResumeMovieList";
import { WatchLaterList } from "./WatchLaterList";
import AppIconButton from "../common/AppIconButton";
import {
  useRecentlyWatchedVideosQuery,
  useVideoDataQuery,
} from "../../hooks/useVideoData.query";
import { useSettings } from "../../hooks/useSettings";

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
  const { settings } = useSettings();

  const { data: sortedMovies, isLoading: loadingMovies } =
    useRecentlyWatchedVideosQuery({
      videoType: "movies",
    });
  const { data: sortedTvShows, isLoading: loadingTvShows } =
    useRecentlyWatchedVideosQuery({
      videoType: "tvShows",
    });

  const { data: movies, isLoading: loadingWatchLater } = useVideoDataQuery({
    filePath: settings?.movieFolderPath || "",
    category: "movies",
  });

  const { handlePosterClick, loadingItems } = useHandlePosterClick(
    menuId,
    setCurrentVideo,
    getSingleEpisodeDetails,
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
        disabled={loadingMovies && loadingTvShows}
      >
        <RefreshIcon />
      </AppIconButton>

      {title("Resume")}
      <Box>
        <ResumeMovieList
          loadingMovies={loadingMovies}
          sortedMovies={sortedMovies}
          handlePosterClick={handlePosterClick}
        />
      </Box>
      <Box sx={{ marginTop: "20px" }}>
        <ResumeTvShowLists
          loadingTvShows={loadingTvShows}
          sortedTvShows={sortedTvShows}
          handlePosterClick={handlePosterClick}
          loadingItems={loadingItems}
        />
      </Box>
      <Box sx={{ marginTop: "20px" }}>{title("Watch Later")}</Box>
      <Box>
        <WatchLaterList
          handlePosterClick={handlePosterClick}
          loadingMovies={loadingWatchLater}
          movies={movies}
        />
      </Box>
    </Box>
  );
};
