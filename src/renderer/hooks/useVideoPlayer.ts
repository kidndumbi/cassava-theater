import { useState, useEffect, use } from "react";
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

  const isMkv = globalVideoPlayer?.src?.toLowerCase().endsWith(".mkv") ?? false;

  useEffect(() => {
    console.log("isMkv", isMkv);
  }, [isMkv]);

  const stopwatchOffset = new Date();
  stopwatchOffset.setSeconds(
    stopwatchOffset.getSeconds() + videoData?.currentTime || 0
  );

  const {
    totalSeconds,
    seconds,
    minutes,
    hours,
    days,
    isRunning,
    start,
    pause: pauseTimer,
    reset,
  } = useStopwatch({ offsetTimestamp: stopwatchOffset });

  useEffect(() => {
    const pad = (num: number) => num.toString().padStart(2, "0");
    const formatted = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    setFormattedTime(formatted);
    console.log(
      "hours",
      hours,
      "minutes",
      minutes,
      "seconds",
      seconds,
      "formattedTime",
      formatted
    );
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

  const skipBy = (seconds: number) => {
    if (globalVideoPlayer) {
      globalVideoPlayer.currentTime += seconds;
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
