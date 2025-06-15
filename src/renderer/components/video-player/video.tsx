import React, { useEffect } from "react";

type VideoProps = {
  videoPlayerRef: React.RefObject<HTMLVideoElement>;
  getSubtitleUrl: () => string;
  subtitleFilePath: string | null;
  isMkv: boolean;
  onClick?: () => void;
  onError: (error: string) => void;
  videoUrl: string;
};

const Video: React.FC<VideoProps> = ({
  videoPlayerRef,
  getSubtitleUrl,
  subtitleFilePath,
  isMkv,
  onClick,
  onError,
  videoUrl,
}) => {
  useEffect(() => {
    const fetchVideoUrl = async () => {
      try {
        const response = await fetch(videoUrl);
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
      className="h-full w-full object-contain"
      controls={!isMkv}
      playsInline
      src={videoUrl || null}
      onClick={onClick}
      onError={(e) => {
        const error = e.currentTarget.error;
        if (error) {
          const errorMessage = `Video playback error: ${error.message}`;
          console.error(errorMessage);
          onError(errorMessage);
        }
      }}
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
