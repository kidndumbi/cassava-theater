import { useState, useEffect } from "react";
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

  const [isFullScreen, setIsFullScreen] = useState(false);
  const [volume, setVolume] = useLocalStorage("volume", 1);
  const globalVideoPlayer = useSelector(selVideoPlayer);

  const hasValidGlobalVideoPlayer =
    globalVideoPlayer && !isEmptyObject(globalVideoPlayer);

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
      globalVideoPlayer.currentTime = startFromBeginning
        ? 0
        : videoData?.currentTime || 0;
      globalVideoPlayer.play();
    };

    const onFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    globalVideoPlayer.addEventListener("ended", onEnded);
    globalVideoPlayer.addEventListener("timeupdate", onTimeUpdate);
    globalVideoPlayer.addEventListener("loadedmetadata", onLoadedMetadata);
    globalVideoPlayer.addEventListener("volumechange", (ev) => {
      setVolume(globalVideoPlayer.volume);
    });
    document.addEventListener("fullscreenchange", onFullscreenChange);

    return () => {
      globalVideoPlayer.removeEventListener("ended", onEnded);
      globalVideoPlayer.removeEventListener("timeupdate", onTimeUpdate);
      globalVideoPlayer.removeEventListener("loadedmetadata", onLoadedMetadata);
      globalVideoPlayer.removeEventListener(
        "fullscreenchange",
        onFullscreenChange
      );
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
  };
};
