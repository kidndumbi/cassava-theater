import { Box, Typography, List } from "@mui/material";
import { VideoDataModel } from "../../../models/videoData.model";
import { PlaylistModel } from "../../../models/playlist.model";
import AppIconButton from "../common/AppIconButton";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import { useSelector } from "react-redux";
import { selVideoPlayer } from "../../store/videoPlayer.slice";
import { useEffect, useState } from "react";
import { useUpdatePlaylist } from "../../hooks/useUpdatePlaylist";
import { useVideoListLogic } from "../../hooks/useVideoListLogic";
import { on } from "../../util/appEvents";
import { PlaylistDrawerItem } from "./PlaylistDrawerItem";

type PlaylistDrawerPanelProps = {
  playlist?: PlaylistModel;
  currentVideo?: VideoDataModel | null;
  onPlayVideo: (video: VideoDataModel) => void;
};

export const PlaylistDrawerPanel = ({
  playlist,
  currentVideo,
  onPlayVideo,
}: PlaylistDrawerPanelProps) => {
  const player = useSelector(selVideoPlayer);
  const { setCurrentVideo } = useVideoListLogic();

  const [playlistVideos, setPlaylistVideos] = useState<VideoDataModel[]>([]);
  const { mutate: updatePlaylist } = useUpdatePlaylist();

  useEffect(() => {
    getPlaylistVideos();
    on<PlaylistModel>("plalylistSet", () => {
      getPlaylistVideos();
    });
  }, []);

  const getPlaylistVideos = async () => {
    const videos: VideoDataModel[] =
      await window.currentlyPlayingAPI.getPlaylistVideos();
    setPlaylistVideos(videos);
  };

  const hasVideos = playlistVideos?.length > 0;
  const currentIndex =
    hasVideos && currentVideo
      ? playlistVideos?.findIndex((v) => v?.filePath === currentVideo?.filePath)
      : -1;
  const canGoPrevious = hasVideos && currentIndex > 0;
  const canGoNext =
    hasVideos && currentIndex >= 0 && currentIndex < playlistVideos?.length - 1;

  return (
    <Box sx={{ width: 350, p: 2 }}>
      <Box className="flex items-center gap-2 pb-3">
        {canGoPrevious && (
          <AppIconButton
            tooltip="play previous"
            onClick={async () => {
              const previousVideo =
                await window.currentlyPlayingAPI.getPreviousPlaylistVideo();
              if (previousVideo) {
                setCurrentVideo(previousVideo);
                updatePlaylist({
                  id: playlist.id,
                  playlist: {
                    ...playlist,
                    lastVideoPlayed: previousVideo.filePath,
                    lastVideoPlayedDate: new Date().toISOString(),
                  },
                });
              }
            }}
          >
            <SkipPreviousIcon />
          </AppIconButton>
        )}
        {canGoNext && (
          <AppIconButton
            tooltip="play next"
            onClick={async () => {
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
              }
            }}
          >
            <SkipNextIcon />
          </AppIconButton>
        )}
      </Box>
      <Typography variant="h6" gutterBottom>
        {playlist?.name || "Playlist"}
      </Typography>
      <List>
        {hasVideos ? (
          playlistVideos?.map((video, idx) => (
            <PlaylistDrawerItem
              player={player}
              idx={idx}
              key={video?.filePath || idx}
              video={video}
              isCurrent={
                currentVideo?.filePath &&
                video?.filePath === currentVideo.filePath
              }
              onPlayVideo={onPlayVideo}
            ></PlaylistDrawerItem>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            No videos in this playlist.
          </Typography>
        )}
      </List>
    </Box>
  );
};
