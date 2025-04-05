import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { VideoDataModel } from "../../../models/videoData.model";
import { useTvShows } from "../../hooks/useTvShows";
import useSortedVideos from "../../hooks/useSortedVideos";
import useHandlePosterClick from "../../hooks/useHandlePosterClick";
import { useVideoListLogic } from "../../hooks/useVideoListLogic";
import ResumeTvShowLists from "./ResumeTvShowLists";
import ResumeMovieList from "./ResumeMovieList";
import { WatchLaterList } from "./WatchLaterList";
import AppIconButton from "../common/AppIconButton";

interface HomePageProps {
  style?: React.CSSProperties;
  movies: VideoDataModel[];
  tvShows: VideoDataModel[];
  loadingTvShows: boolean;
  loadingMovies: boolean;
  refreshData: () => void;
  menuId: string;
}

export const HomePage: React.FC<HomePageProps> = ({
  style,
  movies,
  tvShows,
  loadingTvShows,
  loadingMovies,
  refreshData,
  menuId,
}) => {
  const theme = useTheme();
  const { setCurrentVideo } = useVideoListLogic();
  const { getSingleEpisodeDetails, resetEpisodes, getEpisodeDetails } =
    useTvShows();
  const { sortedMovies, sortedTvShows } = useSortedVideos(movies, tvShows);
  const { handlePosterClick, loadingItems } = useHandlePosterClick(
    menuId,
    setCurrentVideo,
    getSingleEpisodeDetails,
    resetEpisodes,
    getEpisodeDetails,
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
        disabled={loadingMovies && loadingTvShows} // Disable the button when both are loading to prevent multiple calls
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
          loadingMovies={loadingMovies}
          movies={movies}
          tvShows={tvShows}
        />
      </Box>
    </Box>
  );
};
