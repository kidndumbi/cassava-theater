import { useEffect, useState } from "react";
import { useSubtitle } from "../../hooks/useSubtitle";
import { useVideoListLogic } from "../../hooks/useVideoListLogic";
import { useVideoPlayerLogic } from "../../hooks/useVideoPlayerLogic";
import AppVideoPlayer, {
  AppVideoPlayerHandle,
} from "../../components/video-player/AppVideoPlayer";
import { useNavigate, useSearchParams } from "react-router-dom";
import { removeLastSegments } from "../../util/helperFunctions";
import { useTvShows } from "../../hooks/useTvShows";
import { VideoDataModel } from "../../../models/videoData.model";
import { useSettings } from "../../hooks/useSettings";

type VideoPlayerPageProps = {
  appVideoPlayerRef?: React.Ref<AppVideoPlayerHandle>;
};

export const VideoPlayerPage = ({
  appVideoPlayerRef,
}: VideoPlayerPageProps) => {
  const { updateSubtitle, subtitleFilePath, setSubtitleFilePath } =
    useSubtitle();
  const { setCurrentVideo } = useVideoListLogic();
  const { setVideoEnded, updateLastWatched, currentVideo, player, resetVideo } =
    useVideoPlayerLogic();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { episodes, resetEpisodes, findNextEpisode } = useTvShows();
  const { settings } = useSettings();

  const [menuId, setMenuId] = useState("");
  const [resumeId, setResumeId] = useState("");
  const [startFromBeginning, setStartFromBeginning] = useState(false);
  const [isTvShow, setIsTvShow] = useState(false);

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
    return {
      menuId: searchParams.get("menuId") || "",
      startFromBeginning: searchParams.get("startFromBeginning"),
      resumeId: searchParams.get("resumeId") || "",
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
      ref={appVideoPlayerRef}
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
