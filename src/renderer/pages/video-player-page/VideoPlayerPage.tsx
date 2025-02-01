import { useEffect, useState } from "react";
import { rendererLoggingService as log } from "../../util/renderer-logging.service";
import { useSubtitle } from "../../hooks/useSubtitle";
import { useVideoListLogic } from "../../hooks/useVideoListLogic";
import { useVideoPlayerLogic } from "../../hooks/useVideoPlayerLogic";
import AppVideoPlayer from "../../components/video-player/AppVideoPlayer";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../store";
import { videoJsonActions } from "../../store/videoJson.slice";
import {
  getLocationSearchParams,
  removeLastSegments,
} from "../../util/helperFunctions";
import { useTvShows } from "../../hooks/useTvShows";
import { VideoDataModel } from "../../../models/videoData.model";
import { useSettings } from "../../hooks/useSettings";

export const VideoPlayerPage = () => {
  const dispatch = useAppDispatch();
  const { updateSubtitle, subtitleFilePath, setSubtitleFilePath } =
    useSubtitle();
  const { setCurrentVideo } = useVideoListLogic();
  const { setVideoEnded, updateLastWatched, currentVideo, player, resetVideo } =
    useVideoPlayerLogic();
  const navigate = useNavigate();
  const { episodes, resetEpisodes, findNextEpisode } = useTvShows();
  const { settings } = useSettings();

  const [menuId, setMenuId] = useState("");
  const [resumeId, setResumeId] = useState("");
  const [startFromBeginning, setStartFromBeginning] = useState(false);
  const [isTvShow, setIsTvShow] = useState(false);

  useEffect(() => {
    if (currentVideo) {
      dispatch(videoJsonActions.getVideoJson(currentVideo));
    }
  }, [currentVideo, dispatch]);

  useEffect(() => {
    const {
      menuId,
      startFromBeginning: start,
      resumeId,
    } = parseSearchParams(location.search, location.hash);

    setMenuId(menuId);
    setResumeId(resumeId);
    setStartFromBeginning(start === "true");
    setIsTvShow(menuId === "app-tv-shows" || resumeId === "tvShow");
  }, [location.search, location.hash, player, episodes, currentVideo]);

  const parseSearchParams = (search: string, hash: string) => {
    const params = getLocationSearchParams(search, hash);
    return {
      menuId: params.get("menuId") || "",
      startFromBeginning: params.get("startFromBeginning"),
      resumeId: params.get("resumeId") || "",
    };
  };

  const onSubtitleChange = async (sub: string | null) => {
    await updateSubtitle(sub, currentVideo);
    setSubtitleFilePath(sub);
  };

  const pathBuildingStrategies: Record<string, (filePath: string) => string> = {
    "app-movies": (filePath) => filePath,
    "app-home": (filePath) =>
      resumeId === "movie" ? filePath : removeLastSegments(filePath, 2),
    "app-tv-shows": (filePath) => removeLastSegments(filePath, 2),
    default: (filePath) => filePath,
  };

  const navigateToVideoDetails = (filePath: string) => {
    const buildPath =
      pathBuildingStrategies[menuId] || pathBuildingStrategies.default;
    const path = buildPath(filePath);
    const url = `/video-details?menuId=${menuId}&resumeId=${resumeId}&videoPath=${path}`;
    resetEpisodes();
    navigate(url);
  };

  const onVideoEnded = async (
    filePath: string,
    nextEpisode: VideoDataModel | null
  ) => {
    setVideoEnded(true);
    await resetVideo();

    const isTvShowContext =
      menuId === "app-tv-shows" ||
      (menuId === "app-home" && resumeId === "tvShow");

    if (isTvShowContext) {
      if (nextEpisode && settings?.continuousPlay) {
        playNextEpisode(nextEpisode);
      } else {
        navigateToVideoDetails(filePath);
      }
    } else {
      navigateToVideoDetails(filePath);
    }
  };

  const handleCancel = async (filePath: string) => {
    await saveLastWatched();
    navigateToVideoDetails(filePath);
  };

  const saveLastWatched = async () => {
    log.log("saveLastWatched called");
    await updateLastWatched(
      menuId === "app-tv-shows" ||
        (menuId === "app-home" && resumeId === "tvShow")
    );
  };

  const playNextEpisode = (episode: VideoDataModel) => {
    setCurrentVideo(episode);
  };

  return (
    <AppVideoPlayer
      port={settings?.port}
      isTvShow={isTvShow}
      episodes={episodes}
      startFromBeginning={startFromBeginning}
      handleCancel={handleCancel}
      triggeredOnPlayInterval={saveLastWatched}
      onSubtitleChange={onSubtitleChange}
      subtitleFilePath={subtitleFilePath}
      onVideoPaused={saveLastWatched}
      videoData={currentVideo}
      onVideoEnded={onVideoEnded}
      playNextEpisode={playNextEpisode}
      findNextEpisode={findNextEpisode}
    />
  );
};
