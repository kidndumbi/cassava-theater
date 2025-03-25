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
import {
  fetchFolderDetailsApi,
  fetchVideoDetailsApi,
} from "../../store/videoInfo/folderVideosInfoApi";

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
    },
    ref,
  ) => {
    // Refs and hooks
    const { setPlayer } = useVideoListLogic();
    const { mkvCurrentTime, currentVideo } = useVideoPlayerLogic();
    const videoPlayerRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [openDrawer, setOpenDrawer] = useState(false);
    const [openNotesModal, setOpenNotesModal] = useState(false);
    const [sliderValue, setSliderValue] = useState<number | null>(null);

    const debouncedSliderValue = useDebounce(sliderValue, 300);
    const isMouseActive = useMouseActivity();
    const isNotMp4VideoFormat = currentVideo?.isMkv || currentVideo?.isAvi;

    // Video player controls
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

    // URL generators
    const getVideoUrl = () =>
      getUrl(
        "video",
        currentVideo?.filePath,
        startFromBeginning ? 0 : currentVideo?.currentTime,
        port,
      );
    const getSubtitleUrl = () => getUrl("file", subtitleFilePath, null, port);

    // Effects
    useEffect(() => {
      console.log("AppVideoPlayer mounted");
    }, []);

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
          console.log(
            "tv show path",
            removeLastSegments(currentVideo.filePath, 2),
          );

          const tvShowPath = removeLastSegments(currentVideo.filePath, 2);
          const tvShowDetails = await fetchFolderDetailsApi(tvShowPath);

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
            const movieDetails = await fetchVideoDetailsApi({
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
      setOpenNotesModal(true);
    };

    const handleCloseNotesModal = () => {
      setOpenNotesModal(false);
      play?.();
    };

    const handleToggleDrawer = () => {
      pause();
      setOpenDrawer(!openDrawer);
    };

    const handleCloseDrawer = () => {
      setOpenDrawer(false);
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
      <Box className="video-error-container">
        <p>{error}</p>
        <IconButton
          sx={{ color: theme.customVariables.appWhite }}
          onClick={handleCancel.bind(null, currentVideo?.filePath || "")}
        >
          <Clear />
        </IconButton>
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
          isMkv={isNotMp4VideoFormat}
          videoPlayerRef={videoPlayerRef}
          getVideoUrl={getVideoUrl}
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
            />
            <TitleOverlay fileName={currentVideo?.fileName} />
            <SideControlsOverlay
              toggleCastAndCrew={
                castAndCrewContent ? handleToggleDrawer : undefined
              }
              handleCancel={handleCancel}
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
            open={openNotesModal}
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

        <CustomDrawer open={openDrawer} onClose={handleCloseDrawer}>
          {castAndCrewContent}
        </CustomDrawer>
      </div>
    );
  },
);

export default AppVideoPlayer;
