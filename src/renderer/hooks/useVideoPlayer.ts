import { useState, useEffect, useRef } from "react";
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

export const useVideoPlayer = (
  videoEnded?: (filePath: string) => void,
  videoData?: VideoDataModel | undefined,
  startFromBeginning?: boolean,
  triggeredOnPlayInterval?: () => void
) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [playedPercentage, setPlayedPercentage] = useState(0);
  const [formattedTime, setFormattedTime] = useState(""); // new state for formatted time

  const [isFullScreen, setIsFullScreen] = useState(false);
  const [volume, setVolume] = useLocalStorage("volume", 1);
  const globalVideoPlayer = useSelector(selVideoPlayer);

  const isMkv = videoData?.fileName?.toLowerCase().endsWith(".mkv") ?? false;

  const stopwatchOffset = new Date();
  stopwatchOffset.setSeconds(
    stopwatchOffset.getSeconds() + videoData?.currentTime || 0
  );

  const {
    totalSeconds,
    seconds,
    minutes,
    hours,
    start,
    pause: pauseTimer,
    reset,
  } = useStopwatch({ offsetTimestamp: stopwatchOffset });

  // After obtaining totalSeconds from useStopwatch, create a ref for it:
  const totalSecondsRef = useRef(totalSeconds);
  useEffect(() => {
    totalSecondsRef.current = totalSeconds;
  }, [totalSeconds]);

  useEffect(() => {
    const pad = (num: number) => num.toString().padStart(2, "0");
    const formatted = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    setFormattedTime(formatted);
  }, [seconds, minutes, hours]);

  const hasValidGlobalVideoPlayer =
    globalVideoPlayer && !isEmptyObject(globalVideoPlayer);

  // New effect to sync stopwatch state with video play state
  useEffect(() => {
    if (!hasValidGlobalVideoPlayer) return;
    if (globalVideoPlayer.paused) {
      pauseTimer(); // pause stopwatch when video is paused
    } else {
      start(); // resume stopwatch when video is playing
    }
  }, [globalVideoPlayer?.paused]);

  useEffect(() => {
    if (!hasValidGlobalVideoPlayer) {
      return;
    }

    if (volume !== globalVideoPlayer.volume) {
      globalVideoPlayer.volume = volume;
    }

    const interval = setInterval(() => {
      if (hasValidGlobalVideoPlayer && !globalVideoPlayer.paused) {
        if (triggeredOnPlayInterval) {
          triggeredOnPlayInterval();
        }
      }
    }, sec(30));

    return () => clearInterval(interval);
  }, [globalVideoPlayer, volume]);

  // Helper to update the "start" query parameter in the src URL
  const updateSourceWithStart = (additionalSeconds: number): string => {
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
  };

  const skipBy = (seconds: number) => {
    if (!globalVideoPlayer) return;
    
    if (isMkv) {
      const newSrc = updateSourceWithStart(seconds);
      changeSource(newSrc);
      const newOffset = new Date();
      newOffset.setSeconds(newOffset.getSeconds() + totalSecondsRef.current + seconds);
      reset(newOffset, !globalVideoPlayer.paused);
    } else {
      globalVideoPlayer.currentTime += seconds;
      const newOffset = new Date();
      newOffset.setSeconds(newOffset.getSeconds() + globalVideoPlayer.currentTime);
      reset(newOffset, !globalVideoPlayer.paused);
    }
  };

  const updateCurrentTime = (time: number) => {
    if (globalVideoPlayer) {
      globalVideoPlayer.currentTime = time;
    }
  };

  const startPlayingAt = (time: number) => {
    if (globalVideoPlayer) {
      globalVideoPlayer.currentTime = time;
    }
  };

  const play = () => {
    if (globalVideoPlayer) {
      globalVideoPlayer.play();
    }
  };

  const pause = () => {
    if (globalVideoPlayer) {
      globalVideoPlayer.pause();
    }
  };

  const toggleFullscreen = (containerRef: React.RefObject<HTMLDivElement>) => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  // New function to update the video source even while playing
  const changeSource = (newSrc: string) => {
    if (globalVideoPlayer) {
      globalVideoPlayer.pause();
      globalVideoPlayer.src = newSrc;
      globalVideoPlayer.load(); // triggers "loadstart" event and starts loading new src
      globalVideoPlayer.play();
    }
  };

  useEffect(() => {
    if (!hasValidGlobalVideoPlayer) {
      return;
    }

    const onEnded = () => {
      console.log("ended", globalVideoPlayer.src);
      if (videoEnded) {
        videoEnded(globalVideoPlayer.src);
      }
    };

    const onTimeUpdate = () => {
      const currentTime = globalVideoPlayer.currentTime;

      setCurrentTime(currentTime);
      setPlayedPercentage(
        parseFloat(getPlayedPercentage(currentTime, videoData?.duration || 0))
      );
    };

    const onLoadedMetadata = () => {
      if (start) {
        start();
      }
      globalVideoPlayer.currentTime = startFromBeginning
        ? 0
        : videoData?.currentTime || 0;
      globalVideoPlayer.play();
    };

    const onFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    const onPlay = () => {
      start();
    };

    const onPause = () => {
      pauseTimer();
    };

    globalVideoPlayer.addEventListener("ended", onEnded);
    globalVideoPlayer.addEventListener("timeupdate", onTimeUpdate);
    globalVideoPlayer.addEventListener("loadedmetadata", onLoadedMetadata);
    globalVideoPlayer.addEventListener("volumechange", (ev) => {
      setVolume(globalVideoPlayer.volume);
    });
    globalVideoPlayer.addEventListener("play", onPlay);
    globalVideoPlayer.addEventListener("pause", onPause);
    document.addEventListener("fullscreenchange", onFullscreenChange);

    return () => {
      globalVideoPlayer.removeEventListener("ended", onEnded);
      globalVideoPlayer.removeEventListener("timeupdate", onTimeUpdate);
      globalVideoPlayer.removeEventListener("loadedmetadata", onLoadedMetadata);
      globalVideoPlayer.removeEventListener(
        "fullscreenchange",
        onFullscreenChange
      );
      globalVideoPlayer.removeEventListener("play", onPlay);
      globalVideoPlayer.removeEventListener("pause", onPause);
    };
  }, [videoEnded, globalVideoPlayer, videoData, startFromBeginning]);

  return {
    currentTime,
    skipBy,
    playedPercentage,
    isFullScreen,
    toggleFullscreen,
    play,
    startPlayingAt,
    pause,
    updateCurrentTime,
    volume,
    setVolume,
    paused: globalVideoPlayer?.paused,
    isMkv, // new boolean for .mkv file
    formattedTime, // new formatted time string
  };
};
