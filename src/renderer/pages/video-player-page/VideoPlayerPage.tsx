import React, { useEffect, useState, forwardRef } from "react";
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
import CustomDrawer from "../../components/common/CustomDrawer";
import { useModalState } from "../../hooks/useModalState";
import { useUpdatePlaylist } from "../../hooks/useUpdatePlaylist";
import { PlaylistDrawerPanel } from "../../components/playlists/PlaylistDrawerPanel";
import { PlaylistModel } from "../../../models/playlist.model";

type VideoPlayerPageProps = {
  appVideoPlayerRef?: React.Ref<AppVideoPlayerHandle>;
};

export const VideoPlayerPage = forwardRef<
  AppVideoPlayerHandle,
  VideoPlayerPageProps
>(({ appVideoPlayerRef }) => {
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
  const [playlist, setPlaylist] = useState<PlaylistModel | null>();

  useEffect(() => {
    window.currentlyPlayingAPI
      .getCurrentPlaylist()
      .then((playlist: PlaylistModel) => {
        if (playlist) {
          setPlaylist(playlist);
        }
      });
  }, []);

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
  const playlistControlPanel = useModalState(false);
  const { mutate: updatePlaylist } = useUpdatePlaylist();

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
    if (playlist?.id) {
      navigate(`/?menuId=${menuId}&playlistId=${playlist.id}`);
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
      if (playlist?.id) {
        const nextVideo =
          await window.currentlyPlayingAPI.getNextPlaylistVideo();
        if (nextVideo) {
          setCurrentVideo(nextVideo);
          updatePlaylist({
            id: playlist.id,
            playlist: {
              ...playlist,
              lastVideoPlayed: nextVideo.filePath,
              lastVideoPlayedDate: new Date().toISOString(),
            },
          });
        } else {
          playlistControlPanel.setOpen(true);
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
          playlist?.videos?.length > 0
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
          currentVideo={currentVideo}
          onPlayVideo={(video) => {
            setCurrentVideo(video);
            updatePlaylist({
              id: playlist.id,
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
});
