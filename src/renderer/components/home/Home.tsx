import React from "react";
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
import { useAppDispatch, useAppSelector } from "../../store";
import {
  setScrollPoint,
  selectScrollPoint,
} from "../../store/scrollPoint.slice";
import { useSaveJsonData } from "../../hooks/useSaveJsonData";

interface HomePageProps {
  style?: React.CSSProperties;
  refreshData: () => void;
  menuId: string;
}

const SCROLL_KEY = "HomeScroll";

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
  const dispatch = useAppDispatch();
  const scrollPoint = useAppSelector((state) =>
    selectScrollPoint(state, SCROLL_KEY),
  );
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const {
    data: resumeMovies,
    isLoading: loadingResumeMovies,
    refetch: refetchRecentMovies,
  } = useRecentlyWatchedVideosQuery({
    videoType: "movies",
  });
  const { data: resumeTvShows, isLoading: loadingResumeTvShows } =
    useRecentlyWatchedVideosQuery({
      videoType: "tvShows",
    });

  const {
    data: resumeCustom,
    isLoading: isLoadingResumeCustom,
    refetch: refetchRecentCustomVideos,
  } = useRecentlyWatchedCustomVideosQuery();

  const {
    data: watchLaterVideos,
    isLoading: isLoadingWatchLaterVideos,
    refetch: refetchWatchLater,
  } = useWatchlaterVideosQuery();

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

  // Restore scroll position on mount
  React.useEffect(() => {
    if (scrollContainerRef.current && typeof scrollPoint === "number") {
      scrollContainerRef.current.scrollTop = scrollPoint;
    }
  }, [scrollPoint]);

  React.useEffect(() => {
    const ref = scrollContainerRef.current;
    if (!ref) return;
    const handleScroll = () => {
      const value = ref.scrollTop;
      dispatch(setScrollPoint({ key: SCROLL_KEY, value }));
    };
    ref.addEventListener("scroll", handleScroll);
    return () => {
      ref.removeEventListener("scroll", handleScroll);
    };
  }, [dispatch]);

  const { mutateAsync: saveMovieData } = useSaveJsonData();

  return (
    <Box
      className="custom-scrollbar"
      ref={scrollContainerRef}
      style={{
        ...style,
        overflowY: "auto",
        paddingTop: "20px",
        maxHeight: "calc(100vh - 50px)",
      }}
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
          handleResetTime={async (video) => {
            await saveMovieData({
              currentVideo: { filePath: video.filePath },
              newVideoJsonData: { currentTime: 0 },
            });
            refetchRecentMovies();
          }}
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
                  handleResetTime={async (video) => {
                    await saveMovieData({
                      currentVideo: { filePath: video.filePath },
                      newVideoJsonData: { currentTime: 0 },
                    });
                    refetchRecentCustomVideos();
                  }}
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
          onRemoveFromWatchLater={async (video) => {
            await saveMovieData({
              currentVideo: { filePath: video.filePath },
              newVideoJsonData: { watchLater: false },
            });
            refetchWatchLater();
          }}
        />
      </Box>
    </Box>
  );
};
