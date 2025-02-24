import React, { useEffect } from "react";
import styles from "./video.module.css";

type VideoProps = {
  videoPlayerRef: React.RefObject<HTMLVideoElement>;
  getVideoUrl: () => string;
  getSubtitleUrl: () => string;
  subtitleFilePath: string | null;
  isMkv: boolean;
  onClick?: () => void;
  onError: (error: string) => void;
};

const Video: React.FC<VideoProps> = ({
  videoPlayerRef,
  getVideoUrl,
  getSubtitleUrl,
  subtitleFilePath,
  isMkv,
  onClick,
  onError,
}) => {
  useEffect(() => {
    const fetchVideoUrl = async () => {
      try {
        const response = await fetch(getVideoUrl());
        if (!response.ok) {
          const errorMessage = await response.text();
          onError(errorMessage);
        }
      } catch (err) {
        onError(err);
      }
    };

    fetchVideoUrl();
  }, []);

  return (
    <video
      ref={videoPlayerRef}
      crossOrigin="anonymous"
      className={styles.customVideoPlayer}
      controls={!isMkv}
      playsInline
      src={getVideoUrl()}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "contain",
      }}
      onClick={onClick}
    >
      {subtitleFilePath && subtitleFilePath !== "None" && (
        <track
          default
          src={getSubtitleUrl()}
          kind="subtitles"
          srcLang="en"
          label="English"
        />
      )}
    </video>
  );
};

export default Video;
