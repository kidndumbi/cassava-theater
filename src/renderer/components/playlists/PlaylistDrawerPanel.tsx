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
  alpha,
} from "@mui/material";
import theme from "../../theme";
import { removeVidExt, secondsToHms } from "../../util/helperFunctions";
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
            ? alpha(theme.palette.primary.main, 0.1)
            : theme.customVariables.appDark,
          boxShadow: "none",
          border: isCurrent
            ? `1px solid ${theme.palette.primary.main}`
            : "none",
          borderRadius: 1,
          transition: "all 0.3s ease",
          "&:hover": {
            backgroundColor: alpha(theme.palette.primary.main, 0.05),
          },
        }}
      >
        <ListItem disableGutters>
          <ListItemButton
            onClick={() => onPlayVideo(video)}
            sx={{
              py: 1,
              "&:hover": {
                backgroundColor: "transparent",
              },
            }}
          >
            <ListItemAvatar>
              <Box
                sx={{
                  position: "relative",
                  width: 120,
                  height: 68,
                  mr: 2,
                  ...(isCurrent && {
                    border: `2px solid ${theme.palette.primary.main}`,
                    borderRadius: 1,
                    boxShadow: `0 0 12px 2px ${alpha(theme.palette.primary.main, 0.5)}`,
                    animation: "pulse 1.2s infinite alternate",
                  }),
                }}
              >
                <Avatar
                  variant="rounded"
                  src={video?.videoProgressScreenshot || undefined}
                  sx={{
                    width: 120,
                    height: 68,
                    bgcolor: "#bdbdbd",
                  }}
                  alt={video?.fileName}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      width: "100%",
                      fontSize: 12,
                      color: theme.palette.text.secondary,
                    }}
                  >
                    No Image
                  </Box>
                </Avatar>
                {typeof video.currentTime === "number" &&
                  typeof video.duration === "number" &&
                  video.duration > 0 && (
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        zIndex: 20,
                        width: "100%",
                        px: 1,
                        pb: 1,
                      }}
                    >
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
                    color: isCurrent
                      ? theme.palette.primary.main
                      : theme.customVariables.appWhiteSmoke,
                    position: "relative",
                    "&:after": isCurrent
                      ? {
                          content: '""',
                          display: "block",
                          position: "absolute",
                          left: 0,
                          right: 0,
                          bottom: -2,
                          height: 3,
                          borderRadius: 2,
                          background: `linear-gradient(90deg, ${theme.palette.primary.main} 60%, transparent 100%)`,
                          animation: "underline-slide 1.2s infinite alternate",
                        }
                      : undefined,
                  }}
                >
                  {removeVidExt(video?.fileName) || "Untitled"}
                </Typography>
              }
              secondary={
                <Typography variant="body2" color="text.secondary">
                  {secondsToHms(
                    isCurrent ? player.currentTime : video.currentTime || 0,
                  )}
                </Typography>
              }
              sx={{
                my: 0,
                "& .MuiListItemText-secondary": {
                  mt: 0.5,
                },
              }}
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
