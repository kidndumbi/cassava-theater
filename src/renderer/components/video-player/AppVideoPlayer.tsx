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
import { getUrl, secondsTohhmmss } from "../../util/helperFunctions";
import { AppSlider } from "../common/AppSlider";
import { useVideoPlayerLogic } from "../../hooks/useVideoPlayerLogic";
import { useDebounce } from "@uidotdev/usehooks";

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
    ref
  ) => {
    const { setPlayer } = useVideoListLogic();
    const { mkvCurrentTime, currentVideo } = useVideoPlayerLogic();
    const videoPlayerRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

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
      getUrl("video", currentVideo?.filePath, currentVideo?.currentTime, port);
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
      triggeredOnPlayInterval
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
      [currentVideo, episodes, isTvShow]
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

    return (
      <div ref={containerRef} className="video-container">
        <Video
          isMkv={currentVideo.isMkv}
          videoPlayerRef={videoPlayerRef}
          getVideoUrl={getVideoUrl}
          getSubtitleUrl={getSubtitleUrl}
          subtitleFilePath={subtitleFilePath}
          onClick={() => {
            if (currentVideo.isMkv) {
              if (!paused) {
                pause();
              } else {
                play();
              }
            }
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
            />
            <TitleOverlay fileName={currentVideo?.fileName} />
            <SideControlsOverlay
              handleCancel={handleCancel}
              handleNext={
                isTvShow && nextEpisode
                  ? () => playNextEpisode(nextEpisode)
                  : undefined
              }
              filePath={currentVideo?.filePath}
              handleOpenNotesModal={handleOpenNotesModal}
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
        {currentVideo.isMkv && isMouseActive && (
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
      </div>
    );
  }
);

export default AppVideoPlayer;
