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

type PlaylistDrawerPanelProps = {
  playlist?: PlaylistModel;
  playlistVideos?: VideoDataModel[];
  currentVideo?: VideoDataModel | null;
  onPlayVideo: (video: VideoDataModel) => void;
  onNextVideo: () => void;
  onPreviousVideo: () => void;
};

export const PlaylistDrawerPanel = ({
  playlist,
  playlistVideos,
  currentVideo,
  onPlayVideo,
  onNextVideo,
  onPreviousVideo,
}: PlaylistDrawerPanelProps) => {
  const hasVideos = !!playlistVideos?.length;
  const currentIndex =
    hasVideos && currentVideo
      ? playlistVideos.findIndex((v) => v.filePath === currentVideo.filePath)
      : -1;
  const canGoPrevious = hasVideos && currentIndex > 0;
  const canGoNext = hasVideos && currentIndex >= 0 && currentIndex < playlistVideos.length - 1;

  const renderVideoItem = (video: VideoDataModel, idx: number) => {
    const isCurrent = currentVideo?.filePath && video?.filePath === currentVideo.filePath;
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
              console.log("Clicked video:", video);
              onPlayVideo(video);
            }}
          >
            <ListItemAvatar>
              <Avatar
                variant="rounded"
                src={video?.videoProgressScreenshot || undefined}
                sx={{
                  width: 120,
                  height: 68,
                  mr: 2,
                }}
                alt={video?.fileName}
              >
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    bgcolor: "#bdbdbd",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                  }}
                >
                  No Image
                </Box>
              </Avatar>
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
          <AppIconButton tooltip="play previous" onClick={onPreviousVideo}>
            <SkipPreviousIcon />
          </AppIconButton>
        )}
        {canGoNext && (
          <AppIconButton tooltip="play next" onClick={onNextVideo}>
            <SkipNextIcon />
          </AppIconButton>
        )}
      </Box>
      <Typography variant="h6" gutterBottom>
        {playlist?.name || "Playlist"}
      </Typography>
      <List>
        {hasVideos
          ? playlistVideos?.map(renderVideoItem)
          : (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              No videos in this playlist.
            </Typography>
          )
        }
      </List>
    </Box>
  );
};
