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
import { secondsTohhmmss } from "../../util/helperFunctions";

export type AppVideoPlayerHandle = {
  skipBy?: (seconds: number) => void;
  play?: () => void;
  pause?: () => void;
  startPlayingAt?: (seconds: number) => void;
  setVolume: React.Dispatch<React.SetStateAction<number>>
};

type AppVideoPlayerProps = {
  videoData: VideoDataModel | undefined;
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
      videoData,
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
    const { setPlayer, clearPlayer } = useVideoListLogic();
    const videoPlayerRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      console.log("AppVideoPlayer mounted");
      return () => {
        clearPlayer();
      };
    }, []);

    useEffect(() => {
      if (videoPlayerRef.current) {
        setPlayer(videoPlayerRef.current);
      }
    }, [videoData]);

    const getUrl = (
      type: "video" | "file",
      filePath: string | null | undefined,
      start: number | null = null
    ) => {
      return `http://localhost:${port}/${type}?path=${encodeURIComponent(
        filePath || ""
      )}&start=${start || 0}`;
    };

    const getVideoUrl = () =>
      getUrl("video", videoData?.filePath, videoData?.currentTime);
    const getSubtitleUrl = () => getUrl("file", subtitleFilePath);

    const {
      skipBy,
      play,
      pause,
      toggleFullscreen,
      paused,
      startPlayingAt,
      currentTime,
      formattedTime,
      setVolume
    } = useVideoPlayer(
      () => onVideoEnded(videoData?.filePath || "", nextEpisode),
      videoData,
      startFromBeginning,
      triggeredOnPlayInterval
    );

    useImperativeHandle(ref, () => ({
      skipBy,
      play,
      pause,
      startPlayingAt,
      setVolume
    }));

    const isMouseActive = useMouseActivity();
    const nextEpisode = useMemo(
      () => findNextEpisode(videoData?.filePath || ""),
      [videoData, episodes, isTvShow]
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
          isMkv={videoData.isMkv}
          videoPlayerRef={videoPlayerRef}
          getVideoUrl={getVideoUrl}
          getSubtitleUrl={getSubtitleUrl}
          subtitleFilePath={subtitleFilePath}
        />

        {isMouseActive && (
          <>
            <VideoPlayerActionsContainer
              onSubtitleChange={onSubtitleChange}
              subtitleFilePath={subtitleFilePath}
              skip={skipBy}
              onToggleFullscreen={() => toggleFullscreen(containerRef)}
            />
            <TitleOverlay fileName={videoData?.fileName} />
            <SideControlsOverlay
              handleCancel={handleCancel}
              handleNext={
                isTvShow && nextEpisode
                  ? () => playNextEpisode(nextEpisode)
                  : undefined
              }
              filePath={videoData?.filePath}
              handleOpenNotesModal={handleOpenNotesModal}
            />
          </>
        )}
        <NotesModal
          open={openNotesModal}
          handleClose={handleCloseNotesModal}
          videoData={videoData!}
          currentVideoTime={currentTime}
          handleVideoSeek={(seekTime) => {
            handleCloseNotesModal();
            startPlayingAt(seekTime);
          }}
        />
        {videoData.isMkv && isMouseActive && (
          <Box
            style={{
              position: "absolute",
              bottom: "40px",
              left: "20px",
              color: "white",
            }}
          >
            {formattedTime +
              " / " +
              (secondsTohhmmss(videoData?.duration) || "")}
          </Box>
        )}
      </div>
    );
  }
);

export default AppVideoPlayer;
