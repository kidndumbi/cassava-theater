import React, { useEffect } from "react";

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
      className="w-full h-full object-contain"
      controls={!isMkv}
      playsInline
      src={getVideoUrl()}
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
