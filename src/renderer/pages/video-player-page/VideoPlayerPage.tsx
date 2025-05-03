import { useEffect, useState } from "react";
import { useSubtitle } from "../../hooks/useSubtitle";
import { useVideoListLogic } from "../../hooks/useVideoListLogic";
import { useVideoPlayerLogic } from "../../hooks/useVideoPlayerLogic";
import AppVideoPlayer, {
  AppVideoPlayerHandle,
} from "../../components/video-player/AppVideoPlayer";
import { useNavigate, useSearchParams } from "react-router-dom";
import { removeLastSegments } from "../../util/helperFunctions";
import { VideoDataModel } from "../../../models/videoData.model";
import { useVideoDataQuery } from "../../hooks/useVideoData.query";
import { useGetAllSettings } from "../../hooks/settings/useGetAllSettings";

type VideoPlayerPageProps = {
  appVideoPlayerRef?: React.Ref<AppVideoPlayerHandle>;
};

export const VideoPlayerPage = ({
  appVideoPlayerRef,
}: VideoPlayerPageProps) => {
  const { updateSubtitle, subtitleFilePath, setSubtitleFilePath } =
    useSubtitle();
  const { setCurrentVideo, clearPlayer } = useVideoListLogic();
  const {
    setVideoEnded,
    updateVideoDBCurrentTime,
    currentVideo,
    player,
    resetVideo,
  } = useVideoPlayerLogic();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [seasonPath, setSeasonPath] = useState("");

  const { data: episodes } = useVideoDataQuery({
    filePath: seasonPath || "",
    category: "episodes",
  });

  useEffect(() => {
    if (currentVideo) {
      const { filePath } = currentVideo;
      if (filePath) {
        setSeasonPath(removeLastSegments(filePath, 1));
      }
    }
  }, [currentVideo]);

  const { data: settings } = useGetAllSettings();
  const [menuId, setMenuId] = useState("");
  const [resumeId, setResumeId] = useState("");
  const [startFromBeginning, setStartFromBeginning] = useState(false);
  const [isTvShow, setIsTvShow] = useState(false);

  useEffect(() => {
    return () => {
      clearPlayer();
    };
  }, []);

  useEffect(() => {
    const { menuId, startFromBeginning: start, resumeId } = parseSearchParams();

    setMenuId(menuId);
    setResumeId(resumeId);
    setStartFromBeginning(start === "true");
    setIsTvShow(menuId === "app-tv-shows" || resumeId === "tvShow");
  }, [location.search, location.hash, player, currentVideo]);

  const parseSearchParams = () => {
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
    navigate(url);
  };

  const onVideoEnded = async (
    filePath: string,
    nextEpisode: VideoDataModel | null,
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
    await saveVideoDBCurrentTime();
    navigateToVideoDetails(filePath);
  };

  const saveVideoDBCurrentTime = async () => {
    await updateVideoDBCurrentTime(
      menuId === "app-tv-shows" ||
        (menuId === "app-home" && resumeId === "tvShow"),
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
      triggeredOnPlayInterval={saveVideoDBCurrentTime}
      onSubtitleChange={onSubtitleChange}
      subtitleFilePath={subtitleFilePath}
      onVideoPaused={saveVideoDBCurrentTime}
      onVideoEnded={onVideoEnded}
      playNextEpisode={playNextEpisode}
      findNextEpisode={(currentFilePath: string) => {
        const currentIndex = episodes?.findIndex(
          (episode) => episode.filePath === currentFilePath,
        );
        if (currentIndex !== -1 && currentIndex < episodes?.length - 1) {
          return episodes[currentIndex + 1];
        }
        return null;
      }}
    />
  );
};
