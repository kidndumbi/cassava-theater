import React, { createContext, useContext, useRef, useState, useCallback, ReactNode } from "react";
import { VideoDataModel } from "../../models/videoData.model";

interface VideoPlayerContextValue {
  videoPlayerRef: React.MutableRefObject<HTMLVideoElement | null>;
  currentVideo: VideoDataModel | null;
  videoEnded: boolean;
  mkvCurrentTime: number;
  currentTime: number;
  lastVideoPlayedDate: string;
  setCurrentVideo: (video: VideoDataModel | null) => void;
  setPlayer: (player: HTMLVideoElement) => void;
  clearPlayer: () => void;
  setVideoEnded: (ended: boolean) => void;
  setMkvCurrentTime: (time: number) => void;
  setCurrentTime: (time: number) => void;
  setLastVideoPlayedDate: (date: string) => void;
}

const VideoPlayerContext = createContext<VideoPlayerContextValue | null>(null);

export function useVideoPlayerContext(): VideoPlayerContextValue {
  const ctx = useContext(VideoPlayerContext);
  if (!ctx) {
    throw new Error("useVideoPlayerContext must be used within VideoPlayerProvider");
  }
  return ctx;
}

interface VideoPlayerProviderProps {
  children: ReactNode;
}

export function VideoPlayerProvider({ children }: VideoPlayerProviderProps) {
  const videoPlayerRef = useRef<HTMLVideoElement | null>(null);
  const [currentVideo, setCurrentVideoState] = useState<VideoDataModel | null>(null);
  const [videoEnded, setVideoEndedState] = useState(false);
  const [mkvCurrentTime, setMkvCurrentTimeState] = useState(0);
  const [currentTime, setCurrentTimeState] = useState(0);
  const [lastVideoPlayedDate, setLastVideoPlayedDateState] = useState("");

  const setPlayer = useCallback((player: HTMLVideoElement) => {
    videoPlayerRef.current = player;
  }, []);

  const clearPlayer = useCallback(() => {
    videoPlayerRef.current = null;
    setCurrentVideoState(null);
    window.currentlyPlayingAPI.setCurrentPlaylist({ playlist: null });
  }, []);

  // When setting current video, also update the backend
  const setCurrentVideo = useCallback((video: VideoDataModel | null) => {
    setCurrentVideoState((prev) => {
      if (video === null) return null;
      return prev ? { ...prev, ...video } : video;
    });
    if (video) {
      window.currentlyPlayingAPI.setCurrentVideo(video);
    }
  }, []);

  const value: VideoPlayerContextValue = {
    videoPlayerRef,
    currentVideo,
    videoEnded,
    mkvCurrentTime,
    currentTime,
    lastVideoPlayedDate,
    setCurrentVideo,
    setPlayer,
    clearPlayer,
    setVideoEnded: setVideoEndedState,
    setMkvCurrentTime: setMkvCurrentTimeState,
    setCurrentTime: setCurrentTimeState,
    setLastVideoPlayedDate: setLastVideoPlayedDateState,
  };

  return (
    <VideoPlayerContext.Provider value={value}>
      {children}
    </VideoPlayerContext.Provider>
  );
}