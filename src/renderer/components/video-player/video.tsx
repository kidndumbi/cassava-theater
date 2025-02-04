import React from "react";
import "./video.css";

type VideoProps = {
  videoPlayerRef: React.RefObject<HTMLVideoElement>;
  getVideoUrl: () => string;
  getSubtitleUrl: () => string;
  subtitleFilePath: string | null;
  isMkv: boolean;
};

const Video: React.FC<VideoProps> = ({
  videoPlayerRef,
  getVideoUrl,
  getSubtitleUrl,
  subtitleFilePath,
  isMkv,
}) => {

  return (
    <video
      ref={videoPlayerRef}
      crossOrigin="anonymous"
      className="custom-video-player"
      controls={!isMkv}
      playsInline
      src={getVideoUrl()}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "contain",
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
