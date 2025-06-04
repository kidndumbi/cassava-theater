import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  useImperativeHandle,
  forwardRef,
} from "react";
import { VideoDataModel } from "../../../models/videoData.model";
import { useMouseActivity } from "../../hooks/useMouseActivity";
import { useVideoPlayer } from "../../hooks/useVideoPlayer";
import VideoPlayerActionsContainer from "./VideoPlayerActionsContainer";
import TitleOverlay from "./TitleOverlay";
import SideControlsOverlay from "./SideControlsOverlay";
import "./AppVideoPlayer.css";
import { useVideoListLogic } from "../../hooks/useVideoListLogic";
import Video from "./video";
import { NotesModal } from "../common/NotesModal";
import Box from "@mui/material/Box";
import {
  getUrl,
  removeLastSegments,
  secondsTohhmmss,
} from "../../util/helperFunctions";
import { AppSlider } from "../common/AppSlider";
import { useVideoPlayerLogic } from "../../hooks/useVideoPlayerLogic";
import { useDebounce } from "@uidotdev/usehooks";
import theme from "../../theme";
import IconButton from "@mui/material/IconButton";
import { Clear } from "@mui/icons-material";
import CustomDrawer from "../common/CustomDrawer";
import { MovieCastAndCrew } from "../common/MovieCastAndCrew";
import { TvShowCastAndCrew } from "../common/TvShowCastAndCrew";
import { useModalState } from "../../hooks/useModalState";

export type AppVideoPlayerHandle = {
  skipBy?: (seconds: number) => void;
  play?: () => void;
  pause?: () => void;
  startPlayingAt?: (seconds: number) => void;
  setVolume: React.Dispatch<React.SetStateAction<number>>;
  triggereNextEpisode?: () => void;
};

type AppVideoPlayerProps = {
  onVideoEnded: (filePath: string, episode: VideoDataModel | null) => void;
  subtitleFilePath: string | null;
  onVideoPaused: () => void;
  onSubtitleChange: (subtitle: string | null) => void;
  triggeredOnPlayInterval: () => void;
  handleCancel: (filePath: string) => void;
  startFromBeginning: boolean;
  isTvShow: boolean;
  episodes: VideoDataModel[];
  playNextEpisode: (episode: VideoDataModel) => void;
  findNextEpisode: (currentFilePath: string) => VideoDataModel | null;
  port: string;
  openPlaylistControls?: () => void;
};

const AppVideoPlayer = forwardRef<AppVideoPlayerHandle, AppVideoPlayerProps>(
  (
    {
      onVideoEnded,
      subtitleFilePath,
      onVideoPaused,
      onSubtitleChange,
      triggeredOnPlayInterval,
      handleCancel,
      startFromBeginning,
      isTvShow,
      episodes,
      playNextEpisode,
      findNextEpisode,
      port,
      openPlaylistControls,
    },
    ref,
  ) => {
    const { setPlayer } = useVideoListLogic();
    const { mkvCurrentTime, currentVideo } = useVideoPlayerLogic();
    const videoPlayerRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);
    const castAndCrewModal = useModalState(false);
    const notesModal = useModalState(false);
    const [sliderValue, setSliderValue] = useState<number | null>(null);
    const debouncedSliderValue = useDebounce(sliderValue, 300);
    const isMouseActive = useMouseActivity();
    const isNotMp4VideoFormat = currentVideo?.isMkv || currentVideo?.isAvi;
    const [videoUrl, setVideoUrl] = useState<string>("");

    const {
      skipBy,
      play,
      pause,
      toggleFullscreen,
      paused,
      startPlayingAt,
      currentTime,
      formattedTime,
      setVolume,
      isFullScreen,
    } = useVideoPlayer(
      () => onVideoEnded(currentVideo?.filePath || "", nextEpisode),
      currentVideo,
      startFromBeginning,
      triggeredOnPlayInterval,
    );

    // Next episode calculation
    const nextEpisode = useMemo(
      () => findNextEpisode(currentVideo?.filePath || ""),
      [currentVideo, episodes, isTvShow],
    );

    useEffect(() => {
      return () => {
        if (videoPlayerRef.current) {
          videoPlayerRef.current = null;
        }
      };
    }, []);

    const getVideoUrl = () =>
      getUrl(
        "video",
        currentVideo?.filePath,
        startFromBeginning ? 0 : currentVideo?.currentTime,
        port,
      );
    useEffect(() => {
      setVideoUrl(getVideoUrl());
    }, [currentVideo, startFromBeginning, port]);
    const getSubtitleUrl = () => getUrl("file", subtitleFilePath, null, port);

    useEffect(() => {
      if (videoPlayerRef.current) {
        setPlayer(videoPlayerRef.current);
      }
    }, [currentVideo]);

    useEffect(() => {
      if (debouncedSliderValue !== null) {
        startPlayingAt?.(debouncedSliderValue);
      }
    }, [debouncedSliderValue]);

    useEffect(() => {
      if (pause !== undefined && paused) {
        onVideoPaused();
      }
    }, [paused]);

    const [castAndCrewContent, setCastAndCrewContent] =
      useState<React.ReactNode>(null);

    useEffect(() => {
      const fetchCastAndCrew = async () => {
        if (isTvShow) {
          const tvShowPath = removeLastSegments(currentVideo.filePath, 2);
          const tvShowDetails = await window.videoAPI.fetchFolderDetails({
            path: tvShowPath,
          });

          if (tvShowDetails?.tv_show_details?.aggregate_credits) {
            setCastAndCrewContent(
              <TvShowCastAndCrew
                aggregateCredits={
                  tvShowDetails?.tv_show_details?.aggregate_credits
                }
              />,
            );
          }
        } else if (!isTvShow && currentVideo?.movie_details) {
          if (currentVideo?.movie_details?.credits) {
            setCastAndCrewContent(
              <MovieCastAndCrew credits={currentVideo.movie_details.credits} />,
            );
          } else {
            const movieDetails = await window.videoAPI.fetchVideoDetails({
              path: currentVideo.filePath,
              category: "movie",
            });

            if (movieDetails?.movie_details?.credits) {
              setCastAndCrewContent(
                <MovieCastAndCrew
                  credits={movieDetails.movie_details.credits}
                />,
              );
            }
          }
        } else {
          setCastAndCrewContent(null);
        }
      };

      fetchCastAndCrew();
    }, [isTvShow, currentVideo]);

    const handleOpenNotesModal = () => {
      pause?.();
      notesModal.setOpen(true);
    };

    const handleCloseNotesModal = () => {
      notesModal.setOpen(false);
      play?.();
    };

    const handleToggleDrawer = () => {
      pause();
      castAndCrewModal.setOpen(!castAndCrewModal.open);
    };

    const handleCloseDrawer = () => {
      castAndCrewModal.setOpen(false);
      play();
    };

    const renderTimeDisplay = () => (
      <span className="absolute bottom-2.5 left-5 text-sm text-white">
        {formattedTime +
          " / " +
          (secondsTohhmmss(currentVideo?.duration) || "")}
      </span>
    );

    const renderSlider = () => (
      <Box className="absolute bottom-0.5 left-5 m-0 w-[calc(100%-40px)] max-w-full p-0 text-white">
        <AppSlider
          max={currentVideo.duration}
          value={mkvCurrentTime}
          onChange={(event, newValue) => {
            setSliderValue(newValue as number);
          }}
        />
      </Box>
    );

    const renderErrorState = () => (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="100vh"
        width="100vw"
        position="fixed"
        top={0}
        left={0}
        sx={{
          background: "rgba(20, 20, 20, 0.96)",
          zIndex: 2000,
        }}
      >
        <Box
          sx={{
            background: theme.palette.background.paper,
            borderRadius: 3,
            boxShadow: 3,
            p: 4,
            minWidth: 320,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Clear sx={{ fontSize: 48, color: theme.palette.error.main, mb: 1 }} />
          <Box
            sx={{
              color: theme.palette.text.primary,
              fontWeight: 600,
              fontSize: 20,
              mb: 1,
              textAlign: "center",
            }}
          >
            Video Playback Error
          </Box>
          <Box
            sx={{
              color: theme.palette.text.secondary,
              mb: 3,
              textAlign: "center",
              fontSize: 16,
            }}
          >
            {error}
          </Box>
          <IconButton
            sx={{
              color: theme.palette.error.main,
              border: "1px solid",
              borderColor: theme.palette.error.main,
              borderRadius: 2,
              px: 3,
              py: 1,
              fontWeight: 600,
              fontSize: 16,
              transition: "background 0.2s",
              "&:hover": {
                background: theme.palette.error.light,
              },
            }}
            onClick={handleCancel.bind(null, currentVideo?.filePath || "")}
          >
            <Clear sx={{ mr: 1 }} />
            Dismiss
          </IconButton>
        </Box>
      </Box>
    );

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      skipBy,
      play,
      pause,
      startPlayingAt,
      setVolume,
      triggereNextEpisode:
        isTvShow && nextEpisode
          ? () => playNextEpisode(nextEpisode)
          : undefined,
    }));

    if (error) {
      return renderErrorState();
    }

    return (
      <div ref={containerRef} className="video-container">
        <Video
          videoUrl={videoUrl}
          isMkv={isNotMp4VideoFormat}
          videoPlayerRef={videoPlayerRef}
          getSubtitleUrl={getSubtitleUrl}
          subtitleFilePath={subtitleFilePath}
          onClick={() => {
            if (isNotMp4VideoFormat) {
              paused ? play?.() : pause?.();
            }
          }}
          onError={(error) => {
            setError(
              `An error occurred while loading the video: ${
                error || "Unknown error"
              }`,
            );
          }}
        />

        {isMouseActive && (
          <>
            <VideoPlayerActionsContainer
              isFullScreen={isFullScreen}
              paused={paused}
              play={play}
              pause={pause}
              onSubtitleChange={onSubtitleChange}
              subtitleFilePath={subtitleFilePath}
              skip={skipBy}
              onToggleFullscreen={() => toggleFullscreen(containerRef)}
              isNotMp4VideoFormat={isNotMp4VideoFormat}
              onStartFromBeginning={() => {
                startPlayingAt?.(0);
              }}
            />
            <TitleOverlay fileName={currentVideo?.fileName} />
            <SideControlsOverlay
              toggleCastAndCrew={
                castAndCrewContent ? handleToggleDrawer : undefined
              }
              togglePlaylistControl={
                openPlaylistControls ? openPlaylistControls : undefined
              }
              handleCancel={(filePath) => {
                setVideoUrl("");
                handleCancel(filePath);
              }}
              handleNext={
                isTvShow && nextEpisode
                  ? () => playNextEpisode(nextEpisode)
                  : undefined
              }
              filePath={currentVideo?.filePath}
              handleOpenNotesModal={handleOpenNotesModal}
              nextEpisode={nextEpisode}
            />
          </>
        )}

        {currentVideo && (
          <NotesModal
            open={notesModal.open}
            handleClose={handleCloseNotesModal}
            videoData={currentVideo}
            currentVideoTime={currentTime}
            handleVideoSeek={(seekTime) => {
              handleCloseNotesModal();
              startPlayingAt(seekTime);
            }}
          />
        )}

        {isNotMp4VideoFormat && isMouseActive && (
          <>
            {renderTimeDisplay()}
            {renderSlider()}
          </>
        )}

        <CustomDrawer open={castAndCrewModal.open} onClose={handleCloseDrawer}>
          {castAndCrewContent}
        </CustomDrawer>
      </div>
    );
  },
);

export default AppVideoPlayer;
