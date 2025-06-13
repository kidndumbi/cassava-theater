import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Paper,
  ListItemButton,
} from "@mui/material";
import theme from "../../theme";
import { removeVidExt } from "../../util/helperFunctions";
import { VideoDataModel } from "../../../models/videoData.model";
import { PlaylistModel } from "../../../models/playlist.model";
import AppIconButton from "../common/AppIconButton";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import { VideoProgressBar } from "../common/VideoProgressBar";
import { useSelector } from "react-redux";
import { selVideoPlayer } from "../../store/videoPlayer.slice";
import { useEffect, useState } from "react";
import { useUpdatePlaylist } from "../../hooks/useUpdatePlaylist";
import { useVideoListLogic } from "../../hooks/useVideoListLogic";
import { on } from "../../util/appEvents";

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

  const renderVideoItem = (video: VideoDataModel, idx: number) => {
    const isCurrent =
      currentVideo?.filePath && video?.filePath === currentVideo.filePath;

    return (
      <Paper
        elevation={0}
        key={video?.filePath || idx}
        sx={{
          mb: 1,
          backgroundColor: isCurrent
            ? theme.palette.primary.main
            : theme.customVariables.appDark,
          boxShadow: "none",
          border: "none",
        }}
      >
        <ListItem disableGutters>
          <ListItemButton
            onClick={() => {
              onPlayVideo(video);
            }}
          >
            <ListItemAvatar>
              <Box sx={{ position: "relative", width: 120, height: 68, mr: 2 }}>
                <Avatar
                  variant="rounded"
                  src={video?.videoProgressScreenshot || undefined}
                  className="absolute left-0 top-0"
                  sx={{
                    width: 120,
                    height: 68,
                  }}
                  alt={video?.fileName}
                >
                  <Box
                    className="flex h-full w-full items-center justify-center"
                    sx={{
                      bgcolor: "#bdbdbd",
                      fontSize: 12,
                    }}
                  >
                    No Image
                  </Box>
                </Avatar>
                {typeof video.currentTime === "number" &&
                  typeof video.duration === "number" &&
                  video.duration > 0 && (
                    <Box className="absolute bottom-0 left-0 right-0 z-20 w-full px-1 pb-1">
                      <VideoProgressBar
                        current={
                          isCurrent ? player.currentTime : video.currentTime
                        }
                        total={video.duration}
                      />
                    </Box>
                  )}
              </Box>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography
                  variant="subtitle1"
                  fontWeight={isCurrent ? "bold" : "normal"}
                  sx={{
                    color: theme.customVariables.appWhiteSmoke,
                  }}
                >
                  {removeVidExt(video?.fileName) || "Untitled"}
                </Typography>
              }
            />
          </ListItemButton>
        </ListItem>
      </Paper>
    );
  };

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
          playlistVideos?.map(renderVideoItem)
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            No videos in this playlist.
          </Typography>
        )}
      </List>
    </Box>
  );
};
