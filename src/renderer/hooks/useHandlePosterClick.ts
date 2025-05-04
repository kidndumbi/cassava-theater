import { useEffect, useState } from "react";
import { VideoDataModel } from "../../models/videoData.model";
import { useNavigate } from "react-router-dom";
import { rendererLoggingService as log } from "../util/renderer-logging.service";

const useHandlePosterClick = (
  menuId: string,
  setCurrentVideo: (video: VideoDataModel) => void,
  getSingleEpisodeDetails: (
    path: string,
    category: string,
  ) => Promise<VideoDataModel | null>,
  playNonMp4Videos: boolean,
  handlePlayNonMp4Warning?: () => void,
) => {
  const navigate = useNavigate();
  const [loadingItems, setLoadingItems] = useState<{
    [key: string]: boolean;
  }>({});

  const getSelectedVideo = async (videoType: string, video: VideoDataModel) => {
    if (videoType === "tvShow") {
      try {
        const episode = await getSingleEpisodeDetails(
          video.lastVideoPlayed || "",
          "episodes",
        );
        if (episode) {
          return episode;
        }
      } catch (err) {
        log.error("Failed to fetch episode details:", err);
      }
    }
    return video;
  };

  const handlePosterClick = async (
    videoType: string,
    video: VideoDataModel,
    startFromBeginning = false,
  ) => {
    if (video.filePath) {
      setLoadingItems((prev) => ({ ...prev, [video.filePath]: true }));
    }
    try {
      const selectedVideo = await getSelectedVideo(videoType, video);

      const isNotMp4 = !selectedVideo.filePath?.toLowerCase().endsWith(".mp4");

      if (isNotMp4 && !playNonMp4Videos) {
        handlePlayNonMp4Warning?.();
        return;
      }

      const resumeId = videoType === "tvShow" ? "tvShow" : "movie";
      setCurrentVideo(selectedVideo);
      const path = `/video-player?menuId=${menuId}&resumeId=${resumeId}&startFromBeginning=${startFromBeginning}`;
      navigate(path);
    } catch (err) {
      log.error("Error handling poster click:", err);
    } finally {
      if (video.filePath) {
        setLoadingItems((prev) => ({ ...prev, [video.filePath]: false }));
      }
    }
  };

  return { handlePosterClick, loadingItems };
};

export default useHandlePosterClick;
