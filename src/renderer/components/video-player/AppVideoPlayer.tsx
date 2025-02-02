import React, { useRef, useState, useEffect, useMemo } from "react";
import { VideoDataModel } from "../../../models/videoData.model";
import { useMouseActivity } from "../../hooks/useMouseActivity";
import { useVideoPlayer } from "../../hooks/useVideoPlayer";
import VideoPlayerActionsContainer from "./VideoPlayerActionsContainer";
import TitleOverlay from "./TitleOverlay";
import SideControlsOverlay from "./SideControlsOverlay";
import { rendererLoggingService as log } from "../../util/renderer-logging.service";
import "./AppVideoPlayer.css";
// import { NotesModal } from "../common/NotesModal";
import { useVideoListLogic } from "../../hooks/useVideoListLogic";

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

const AppVideoPlayer: React.FC<AppVideoPlayerProps> = ({
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
}) => {
  const { setPlayer, clearPlayer } = useVideoListLogic();
  const videoPlayerRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      clearPlayer();
    };
  }, []);

  useEffect(() => {

    if (videoPlayerRef.current) {
      setPlayer(videoPlayerRef.current);
    }
  }, [videoData]);

  const getUrl = (type: "video" | "file", filePath: string | null | undefined) => {
    return `http://localhost:${port}/${type}?path=${encodeURIComponent(filePath || "")}`;
  };

  const getVideoUrl = () => getUrl("video", videoData?.filePath);
  const getSubtitleUrl = () => getUrl("file", subtitleFilePath);

  const {
    skipBy,
    startPlayingAt,
    play,
    pause,
    toggleFullscreen,
    currentTime,
    paused,
  } = useVideoPlayer(
    () => onVideoEnded(videoData?.filePath || "", nextEpisode),
    videoData,
    startFromBeginning,
    triggeredOnPlayInterval
  );

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
      <video
        ref={videoPlayerRef}
        crossOrigin="anonymous"
        className="custom-video-player"
        controls
        playsInline
        src={getVideoUrl()}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
        }}
      >
        {subtitleFilePath && (
          <track
            default
            src={getSubtitleUrl()}
            kind="subtitles"
            srcLang="en"
            label="English"
          />
        )}
      </video>

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
      {/* <NotesModal
        open={openNotesModal}
        handleClose={handleCloseNotesModal}
        videoData={videoData!}
        currentVideoTime={currentTime}
        handleVideoSeek={(seekTime) => {
          handleCloseNotesModal();
          startPlayingAt(seekTime);
        }}
      /> */}
    </div>
  );
};

export default AppVideoPlayer;
