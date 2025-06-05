import { useState, useEffect, useRef, useCallback } from "react";
import { useStopwatch } from "react-timer-hook";
import { VideoDataModel } from "../../models/videoData.model";
import {
  getPlayedPercentage,
  isEmptyObject,
  sec,
} from "../util/helperFunctions";
import { useLocalStorage } from "@uidotdev/usehooks";
import { useSelector } from "react-redux";
import { selVideoPlayer } from "../store/videoPlayer.slice";
import { useVideoPlayerLogic } from "./useVideoPlayerLogic";

export const useVideoPlayer = (
  videoEnded?: (filePath: string) => void,
  videoData?: VideoDataModel,
  startFromBeginning?: boolean,
  triggeredOnPlayInterval?: () => void,
) => {
  const { setMkvCurrentTime } = useVideoPlayerLogic();
  const [currentTime, setCurrentTime] = useState(0);
  const [playedPercentage, setPlayedPercentage] = useState(0);
  const [formattedTime, setFormattedTime] = useState("");
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [volume, setVolume] = useLocalStorage("volume", 1);
  const globalVideoPlayer = useSelector(selVideoPlayer);

  // Helper function to calculate stopwatch offset
  const getStopwatchOffset = (currentTime = 0) => {
    const offset = new Date();
    offset.setSeconds(offset.getSeconds() + currentTime);
    return offset;
  };

  const {
    totalSeconds,
    seconds,
    minutes,
    hours,
    start: startTimer,
    pause: pauseTimer,
    reset: resetTimer,
  } = useStopwatch({
    offsetTimestamp: getStopwatchOffset(videoData?.currentTime),
  });

  const totalSecondsRef = useRef(totalSeconds);
  const hasValidGlobalVideoPlayer =
    globalVideoPlayer && !isEmptyObject(globalVideoPlayer);

  // Update totalSecondsRef and formatted time
  useEffect(() => {
    totalSecondsRef.current = totalSeconds;
    setMkvCurrentTime(totalSecondsRef.current);
    setFormattedTime(formatTime(hours, minutes, seconds));
  }, [totalSeconds, hours, minutes, seconds]);

  // Sync stopwatch with video play state
  useEffect(() => {
    if (!hasValidGlobalVideoPlayer) return;
    globalVideoPlayer.paused ? pauseTimer() : startTimer();
  }, [globalVideoPlayer?.paused]);

  // Handle volume changes and play interval
  useEffect(() => {
    if (!hasValidGlobalVideoPlayer) return;

    if (volume !== globalVideoPlayer.volume) {
      globalVideoPlayer.volume = volume;
    }

    const interval = setInterval(() => {
      if (!globalVideoPlayer.paused && triggeredOnPlayInterval) {
        triggeredOnPlayInterval();
      }
    }, sec(30));

    return () => clearInterval(interval);
  }, [globalVideoPlayer, volume]);

  // Reset stopwatch when videoData changes
  useEffect(() => {
    if (videoData) {
      const offset = getStopwatchOffset(
        startFromBeginning ? 0 : videoData.currentTime,
      );
      resetTimer(offset, !globalVideoPlayer?.paused);
    }
  }, [videoData, globalVideoPlayer]);

  // Helper function to format time
  const formatTime = (hours: number, minutes: number, seconds: number) => {
    const pad = (num: number) => num.toString().padStart(2, "0");
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  // Helper function to update video source with start time
  const updateSourceWithStart = useCallback(
    (additionalSeconds: number): string => {
      try {
        const url = new URL(globalVideoPlayer.src, window.location.href);
        let newStart = (totalSecondsRef.current || 0) + additionalSeconds;
        if (videoData?.duration) {
          newStart = Math.max(0, Math.min(newStart, videoData.duration));
        }
        url.searchParams.set("start", newStart.toString());
        return url.toString();
      } catch (e) {
        console.error("Failed to update the src URL:", e);
        return globalVideoPlayer.src;
      }
    },
    [globalVideoPlayer, videoData],
  );

  // Skip video by a specified number of seconds
  const skipBy = useCallback(
    (seconds: number) => {
      if (!globalVideoPlayer || !videoData) return;

      if (videoData.isMkv || videoData.isAvi) {
        const newSrc = updateSourceWithStart(seconds);
        changeSource(newSrc);
        const newOffset = getStopwatchOffset(totalSecondsRef.current + seconds);
        resetTimer(newOffset, !globalVideoPlayer.paused);
      } else {
        globalVideoPlayer.currentTime += seconds;
        const newOffset = getStopwatchOffset(globalVideoPlayer.currentTime);
        resetTimer(newOffset, !globalVideoPlayer.paused);
      }
    },
    [globalVideoPlayer, videoData, updateSourceWithStart],
  );

  const setPlaybackSpeed = useCallback(
    (speed: number) => {
      if (!globalVideoPlayer) return;
      globalVideoPlayer.playbackRate = speed;
    },
    [globalVideoPlayer],
  );

  // Start playing video at a specific time
  const startPlayingAt = useCallback(
    (time: number) => {
      if (!globalVideoPlayer || !videoData) return;

      if (videoData.isMkv || videoData.isAvi) {
        const additionalSeconds = time - globalVideoPlayer.currentTime;
        const newSrc = updateSourceWithStart(additionalSeconds);
        changeSource(newSrc);
        const newOffset = getStopwatchOffset(time);
        resetTimer(newOffset, !globalVideoPlayer.paused);
      } else {
        globalVideoPlayer.currentTime = time;
        const newOffset = getStopwatchOffset(time);
        resetTimer(newOffset, !globalVideoPlayer.paused);
      }
    },
    [globalVideoPlayer, videoData, updateSourceWithStart],
  );

  // Change video source
  const changeSource = useCallback(
    (newSrc: string) => {
      if (globalVideoPlayer) {
        globalVideoPlayer.pause();
        globalVideoPlayer.src = newSrc;
        globalVideoPlayer.load();
        globalVideoPlayer.play();
      }
    },
    [globalVideoPlayer],
  );

  // Toggle fullscreen mode
  const toggleFullscreen = useCallback(
    (containerRef: React.RefObject<HTMLDivElement>) => {
      if (!document.fullscreenElement) {
        containerRef.current?.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    },
    [],
  );

  // Event listeners for video player
  useEffect(() => {
    if (!hasValidGlobalVideoPlayer) return;

    const onEnded = () => videoEnded?.(globalVideoPlayer.src);
    const onTimeUpdate = () => {
      window.currentlyPlayingAPI.setCurrentTime(globalVideoPlayer.currentTime);
      setCurrentTime(globalVideoPlayer.currentTime);
      setPlayedPercentage(
        parseFloat(
          getPlayedPercentage(
            globalVideoPlayer.currentTime,
            videoData?.duration || 0,
          ),
        ),
      );
    };
    const onLoadedMetadata = () => {
      startTimer();
      globalVideoPlayer.currentTime = startFromBeginning
        ? 0
        : videoData?.currentTime || 0;
      globalVideoPlayer.play();
    };
    const onFullscreenChange = () =>
      setIsFullScreen(!!document.fullscreenElement);
    const onPlay = () => startTimer();
    const onPause = () => pauseTimer();

    const eventListeners = [
      { event: "ended", handler: onEnded },
      { event: "timeupdate", handler: onTimeUpdate },
      { event: "loadedmetadata", handler: onLoadedMetadata },
      {
        event: "volumechange",
        handler: () => setVolume(globalVideoPlayer.volume),
      },
      { event: "play", handler: onPlay },
      { event: "pause", handler: onPause },
    ];

    eventListeners.forEach(({ event, handler }) =>
      globalVideoPlayer.addEventListener(event, handler),
    );
    document.addEventListener("fullscreenchange", onFullscreenChange);

    return () => {
      eventListeners.forEach(({ event, handler }) =>
        globalVideoPlayer.removeEventListener(event, handler),
      );
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, [videoEnded, globalVideoPlayer, videoData, startFromBeginning]);

  return {
    currentTime,
    skipBy,
    playedPercentage,
    isFullScreen,
    toggleFullscreen,
    play: () => globalVideoPlayer?.play(),
    startPlayingAt,
    pause: () => globalVideoPlayer?.pause(),
    updateCurrentTime: (time: number) =>
      globalVideoPlayer && (globalVideoPlayer.currentTime = time),
    volume,
    setVolume,
    paused: globalVideoPlayer?.paused,
    formattedTime,
    setPlaybackSpeed,
  };
};
