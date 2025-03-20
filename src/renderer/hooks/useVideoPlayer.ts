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

  const stopwatchOffset = new Date();
  stopwatchOffset.setSeconds(
    stopwatchOffset.getSeconds() + (videoData?.currentTime || 0),
  );

  const {
    totalSeconds,
    seconds,
    minutes,
    hours,
    start: startTimer,
    pause: pauseTimer,
    reset: resetTimer,
  } = useStopwatch({ offsetTimestamp: stopwatchOffset });

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

  // Add new useEffect below existing ones
  useEffect(() => {
    if (videoData) {
      const stopwatchOffset = new Date();
      stopwatchOffset.setSeconds(stopwatchOffset.getSeconds() + (videoData?.currentTime || 0));
      resetTimer(stopwatchOffset, !globalVideoPlayer?.paused);
    }
  }, [videoData, globalVideoPlayer]);

  // Helper functions
  const formatTime = (hours: number, minutes: number, seconds: number) => {
    const pad = (num: number) => num.toString().padStart(2, "0");
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const updateSourceWithStart = useCallback(
    (additionalSeconds: number): string => {
      try {
        const url = new URL(globalVideoPlayer.src, window.location.href);
        let newStart = totalSecondsRef.current + additionalSeconds;
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

  const skipBy = useCallback(
    (seconds: number) => {
      if (!globalVideoPlayer || !videoData) return;

      if (videoData.isMkv || videoData.isAvi) {
        const newSrc = updateSourceWithStart(seconds);
        changeSource(newSrc);
        const newOffset = new Date();
        newOffset.setSeconds(
          newOffset.getSeconds() + totalSecondsRef.current + seconds,
        );
        resetTimer(newOffset, !globalVideoPlayer.paused);
      } else {
        globalVideoPlayer.currentTime += seconds;
        const newOffset = new Date();
        newOffset.setSeconds(
          newOffset.getSeconds() + globalVideoPlayer.currentTime,
        );
        resetTimer(newOffset, !globalVideoPlayer.paused);
      }
    },
    [globalVideoPlayer, videoData, updateSourceWithStart],
  );

  const startPlayingAt = useCallback(
    (time: number) => {
      console.log("startPlayingAt", time);
      if (!globalVideoPlayer || !videoData) return;

      if (videoData.isMkv || videoData.isAvi) {
        const additionalSeconds = time - globalVideoPlayer.currentTime;
        const newSrc = updateSourceWithStart(additionalSeconds);
        changeSource(newSrc);
        const newOffset = new Date();
        newOffset.setSeconds(newOffset.getSeconds() + time);
        resetTimer(newOffset, !globalVideoPlayer.paused);
      } else {
        globalVideoPlayer.currentTime = time;
        const newOffset = new Date();
        newOffset.setSeconds(newOffset.getSeconds() + time);
        resetTimer(newOffset, !globalVideoPlayer.paused);
      }
    },
    [globalVideoPlayer, videoData, updateSourceWithStart],
  );

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

  // Event listeners
  useEffect(() => {
    if (!hasValidGlobalVideoPlayer) return;

    const onEnded = () => videoEnded?.(globalVideoPlayer.src);
    const onTimeUpdate = () => {
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
      console.log("Loaded metadata");
      console.log("videoData?.currentTime", videoData?.currentTime);
      startTimer();
      globalVideoPlayer.currentTime = startFromBeginning
        ? 0
        : videoData?.currentTime || 0;
      globalVideoPlayer.play();
      console.log(
        "globalVideoPlayer.currentTime",
        globalVideoPlayer.currentTime,
      );
    };
    const onFullscreenChange = () =>
      setIsFullScreen(!!document.fullscreenElement);
    const onPlay = () => startTimer();
    const onPause = () => pauseTimer();

    globalVideoPlayer.addEventListener("ended", onEnded);
    globalVideoPlayer.addEventListener("timeupdate", onTimeUpdate);
    globalVideoPlayer.addEventListener("loadedmetadata", onLoadedMetadata);
    globalVideoPlayer.addEventListener("volumechange", () =>
      setVolume(globalVideoPlayer.volume),
    );
    globalVideoPlayer.addEventListener("play", onPlay);
    globalVideoPlayer.addEventListener("pause", onPause);
    document.addEventListener("fullscreenchange", onFullscreenChange);

    return () => {
      globalVideoPlayer.removeEventListener("ended", onEnded);
      globalVideoPlayer.removeEventListener("timeupdate", onTimeUpdate);
      globalVideoPlayer.removeEventListener("loadedmetadata", onLoadedMetadata);
      globalVideoPlayer.removeEventListener("volumechange", () =>
        setVolume(globalVideoPlayer.volume),
      );
      globalVideoPlayer.removeEventListener("play", onPlay);
      globalVideoPlayer.removeEventListener("pause", onPause);
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
  };
};
