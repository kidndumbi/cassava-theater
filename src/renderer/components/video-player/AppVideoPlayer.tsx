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

export type AppVideoPlayerHandle = {
  skipBy?: (seconds: number) => void;
  play?: () => void;
  pause?: () => void;
  startPlayingAt?: (seconds: number) => void;
  setVolume: React.Dispatch<React.SetStateAction<number>>;
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
    const { setPlayer } = useVideoListLogic();
    const { mkvCurrentTime, currentVideo } = useVideoPlayerLogic();
    const isNotMp4VideoFormat = currentVideo?.isMkv || currentVideo?.isAvi;
    const videoPlayerRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [error, setError] = useState<string | null>(null);
    const [openDrawer, setOpenDrawer] = useState(false);

    useEffect(() => {
      console.log("AppVideoPlayer mounted");
    }, []);

    useEffect(() => {
      if (videoPlayerRef.current) {
        setPlayer(videoPlayerRef.current);
      }
    }, [currentVideo]);

    const [sliderValue, setSliderValue] = useState<number | null>(null);
    const debouncedSliderValue = useDebounce(sliderValue, 300);

    useEffect(() => {
      if (debouncedSliderValue !== null) {
        startPlayingAt?.(debouncedSliderValue);
      }
    }, [debouncedSliderValue]);

    const getVideoUrl = () =>
      getUrl(
        "video",
        currentVideo?.filePath,
        startFromBeginning ? 0 : currentVideo?.currentTime,
        port,
      );
    const getSubtitleUrl = () => getUrl("file", subtitleFilePath, null, port);

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

    useImperativeHandle(ref, () => ({
      skipBy,
      play,
      pause,
      startPlayingAt,
      setVolume,
    }));

    const isMouseActive = useMouseActivity();
    const nextEpisode = useMemo(
      () => findNextEpisode(currentVideo?.filePath || ""),
      [currentVideo, episodes, isTvShow],
    );

    useEffect(() => {
      if (pause !== undefined) {
        if (paused) {
          onVideoPaused();
        }
      }
    }, [paused]);

    const [openNotesModal, setOpenNotesModal] = useState(false);
    const handleOpenNotesModal = () => {
      pause?.();
      setOpenNotesModal(true);
    };
    const handleCloseNotesModal = () => {
      setOpenNotesModal(false);
      play?.();
    };

    const renderTvShowCastAndCrew = () => {
      // console.log("currentVideo filepath", currentVideo.filePath);
      // console.log("tv show path", removeLastSegments(currentVideo.filePath, 2));

      if (currentVideo?.tv_show_details?.aggregate_credits) {
        console.log(
          "currentVideo.tv_show_details.aggregate_credits",
          currentVideo.tv_show_details.aggregate_credits,
        );
        return (
          <TvShowCastAndCrew
            aggregateCredits={currentVideo.tv_show_details.aggregate_credits}
          />
        );
      }
      return null;
    };

    const renderMovieCastAndCrew = () => {
      if (currentVideo?.movie_details?.credits) {
        return (
          <MovieCastAndCrew credits={currentVideo.movie_details.credits} />
        );
      }
      return null;
    };

    const displayCastAndCrew = () => {
      return isTvShow ? renderTvShowCastAndCrew() : renderMovieCastAndCrew();
    };

    if (error) {
      return (
        <Box
          sx={{
            display: "flex",
            height: "100vh",
            padding: "30%",
            color: theme.customVariables.appWhiteSmoke,
            flexDirection: "column",
          }}
        >
          <p>{error}</p>
          <IconButton
            sx={{ color: theme.customVariables.appWhite }}
            onClick={handleCancel.bind(null, currentVideo?.filePath || "")}
          >
            <Clear />
          </IconButton>
        </Box>
      );
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
              if (!paused) {
                pause();
              } else {
                play();
              }
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
              onToggleFullscreen={() => {
                toggleFullscreen(containerRef);
              }}
              isNotMp4VideoFormat={isNotMp4VideoFormat}
            />
            <TitleOverlay fileName={currentVideo?.fileName} />
            <SideControlsOverlay
              toggleCastAndCrew={() => {
                pause();
                setOpenDrawer(!openDrawer);
              }}
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
            <span
              style={{
                position: "absolute",
                bottom: "10px",
                left: "20px",
                color: "white",
                fontSize: "14px",
              }}
            >
              {formattedTime +
                " / " +
                (secondsTohhmmss(currentVideo?.duration) || "")}
            </span>
            <Box
              style={{
                position: "absolute",
                bottom: "1px",
                left: "20px",
                color: "white",
                width: "100%",
                margin: 0,
                padding: 0,
                marginRight: "20px",
              }}
            >
              <AppSlider
                max={currentVideo.duration}
                value={mkvCurrentTime}
                onChange={(event, newValue) => {
                  setSliderValue(newValue as number);
                }}
              ></AppSlider>
            </Box>
          </>
        )}

        <CustomDrawer
          open={openDrawer}
          onClose={() => {
            setOpenDrawer(false);
            play();
          }}
        >
          {displayCastAndCrew()}
        </CustomDrawer>
      </div>
    );
  },
);

export default AppVideoPlayer;
