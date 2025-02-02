import React, { useEffect } from "react";
import { VideoDataModel } from "../../models/videoData.model";
import { removeLastSegments } from "../util/helperFunctions";
import { useNavigate } from "react-router-dom";
import { rendererLoggingService as log } from "../util/renderer-logging.service";
// import log from 'electron-log/renderer';

const useHandlePosterClick = (
  menuId: string,
  setCurrentVideo: (video: VideoDataModel) => void,
  getSingleEpisodeDetails: (id: string) => Promise<VideoDataModel | null>,
  resetEpisodes: () => void,
  getEpisodeDetails: (path: string) => void
) => {
  const navigate = useNavigate();
  const [loadingItems, setLoadingItems] = React.useState<{
    [key: string]: boolean;
  }>({});

  const getSelectedVideo = async (videoType: string, video: VideoDataModel) => {
    if (videoType === "tvShow") {
      try {
        const episode = await getSingleEpisodeDetails(
          video.lastVideoPlayed || ""
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
    video: VideoDataModel
  ) => {
    setLoadingItems((prev) => ({ ...prev, [video.filePath!]: true }));
    const selectedVideo = await getSelectedVideo(videoType, video);
    const resumeId = videoType === "tvShow" ? "tvShow" : "movie";
    const seasonPath =
      videoType === "tvShow"
        ? removeLastSegments(video.lastVideoPlayed || "", 1)
        : "";
    resetEpisodes();
    getEpisodeDetails(seasonPath);
    setCurrentVideo(selectedVideo);
    const path = `/video-player?menuId=${menuId}&resumeId=${resumeId}`;
    navigate(path);
    setLoadingItems((prev) => ({ ...prev, [video.filePath!]: false }));
  };

  return { handlePosterClick, loadingItems };
};

export default useHandlePosterClick;
