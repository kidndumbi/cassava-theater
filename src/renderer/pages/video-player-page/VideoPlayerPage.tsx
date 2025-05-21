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
import { useQuery } from "@tanstack/react-query";
import { useGetPlaylistVideoData } from "../../hooks/useGetPlaylistVideoData";
import CustomDrawer from "../../components/common/CustomDrawer";

import { useModalState } from "../../hooks/useModalState";

import { PlaylistDrawerPanel } from "../../components/playlists/PlaylistDrawerPanel";
import { useUpdatePlaylist } from "../../hooks/useUpdatePlaylist";

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
  const { mutate: updatePlaylist } = useUpdatePlaylist();

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
  const [playlistId, setPlaylistId] = useState("");
  const [shuffle, setShuffle] = useState(false);
  const playlistControlPanel = useModalState(false);
  const [playlistVideos, setPlaylistVideos] = useState<
    VideoDataModel[] | undefined
  >();
  const [playlistShuffled, setPlaylistShuffled] = useState(false);

  useEffect(() => {
    return () => {
      clearPlayer();
    };
  }, []);

  useEffect(() => {
    const {
      menuId,
      startFromBeginning: start,
      resumeId,
      playlistId,
      shuffle,
    } = parseSearchParams();

    setMenuId(menuId);
    setResumeId(resumeId);
    setStartFromBeginning(start === "true");
    setIsTvShow(menuId === "app-tv-shows" || resumeId === "tvShow");
    setPlaylistId(playlistId);
    setShuffle(shuffle);
  }, [location.search, location.hash, player, currentVideo]);

  const parseSearchParams = () => {
    return {
      menuId: searchParams.get("menuId") || "",
      startFromBeginning: searchParams.get("startFromBeginning"),
      resumeId: searchParams.get("resumeId") || "",
      playlistId: searchParams.get("playlistId") || "",
      shuffle: searchParams.get("shuffle") === "true",
    };
  };

  const { data: playlist } = useQuery({
    queryKey: ["playlist", playlistId],
    queryFn: () => window.playlistAPI.getPlaylist(playlistId),
    enabled: !!playlistId,
  });

  const { data: receivedPlaylistVideos } = useGetPlaylistVideoData(playlist);

  useEffect(() => {
    if (
      receivedPlaylistVideos &&
      receivedPlaylistVideos.length > 0 &&
      currentVideo
    ) {
      if (shuffle && !playlistShuffled) {
        const currentVideoFilePath = currentVideo.filePath;
        const videos = [...receivedPlaylistVideos];
        const currentIdx = videos.findIndex(
          (v) => v?.filePath === currentVideoFilePath,
        );
        let currentVideoItem: VideoDataModel | undefined;
        if (currentIdx !== -1) {
          currentVideoItem = videos.splice(currentIdx, 1)[0];
        }
        // Fisher-Yates shuffle
        for (let i = videos.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [videos[i], videos[j]] = [videos[j], videos[i]];
        }
        if (currentVideoItem) {
          setPlaylistVideos([currentVideoItem, ...videos]);
        } else {
          setPlaylistVideos(videos);
        }
        setPlaylistShuffled(true);
      } else if (!shuffle) {
        setPlaylistVideos(receivedPlaylistVideos);
        setPlaylistShuffled(false);
      }
    }
  }, [receivedPlaylistVideos, shuffle, currentVideo, playlistShuffled]);

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
    if (playlistId) {
      navigate(`/?menuId=${menuId}&playlistId=${playlistId}`);
      return;
    }
    const folderId = searchParams.get("folderId");
    const buildPath =
      pathBuildingStrategies[menuId] || pathBuildingStrategies.default;
    const path = buildPath(filePath);

    const params = new URLSearchParams();
    params.append("menuId", menuId);
    params.append("resumeId", resumeId);
    params.append("videoPath", path);
    if (folderId) params.append("folderId", folderId);

    navigate(`/video-details?${params.toString()}`);
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
      if (playlistId) {
        // Find the next video in playlistVideos after currentVideo
        if (playlistVideos && currentVideo) {
          const idx = playlistVideos.findIndex(
            (v) => v?.filePath === currentVideo.filePath,
          );
          if (idx !== -1 && idx < playlistVideos.length - 1) {
            const nextVideo = playlistVideos[idx + 1];
            setCurrentVideo(nextVideo);
          } else {
            // No more items to play, go to details of current video
            navigateToVideoDetails(currentVideo.filePath ?? "");
          }
        }
      } else {
        navigateToVideoDetails(filePath);
      }
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
    <>
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
        openPlaylistControls={
          playlistVideos
            ? playlistControlPanel.setOpen.bind(null, true)
            : undefined
        }
      />
      <CustomDrawer
        open={playlistControlPanel.open}
        onClose={playlistControlPanel.setOpen.bind(null, false)}
        anchor="right"
      >
        <PlaylistDrawerPanel
          playlist={playlist}
          playlistVideos={playlistVideos}
          currentVideo={currentVideo}
          onPlayVideo={(video) => {
            setCurrentVideo(video);
            playlistControlPanel.setOpen(false);
            updatePlaylist({
              id: playlistId,
              playlist: {
                ...playlist,
                lastVideoPlayed: video.filePath,
                lastVideoPlayedDate: new Date().toISOString(),
              },
            });
          }}
        />
      </CustomDrawer>
    </>
  );
};
