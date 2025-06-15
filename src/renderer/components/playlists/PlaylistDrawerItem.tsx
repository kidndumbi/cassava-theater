import {
  Box,
  Typography,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Paper,
  ListItemButton,
  alpha,
} from "@mui/material";
import theme from "../../theme";
import { removeVidExt, secondsToHms, trimFileName } from "../../util/helperFunctions";
import { VideoDataModel } from "../../../models/videoData.model";
import { VideoProgressBar } from "../common/VideoProgressBar";

type PlaylistDrawerItemProps = {
  video: VideoDataModel;
  idx: number;
  isCurrent: boolean;
  player: HTMLVideoElement;
  onPlayVideo: (video: VideoDataModel) => void;
};

export const PlaylistDrawerItem = ({
  video,
  idx,
  isCurrent,
  player,
  onPlayVideo,
}: PlaylistDrawerItemProps) => (
  <Paper
    elevation={0}
    key={video?.filePath || idx}
    sx={{
      mb: 1,
      backgroundColor: isCurrent
        ? alpha(theme.palette.primary.main, 0.1)
        : theme.customVariables.appDark,
      boxShadow: "none",
      border: isCurrent ? `1px solid ${theme.palette.primary.main}` : "none",
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
                    current={isCurrent ? player.currentTime : video.currentTime}
                    total={video.duration}
                    color="primary"
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
                fontSize: 16,
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
              {trimFileName(removeVidExt(video?.fileName)) || "Untitled"}
            </Typography>
          }
          secondary={
            <Typography variant="body2" sx={{ color: theme.palette.grey[400] }}>
              {secondsToHms(
                isCurrent ? player.currentTime : video.currentTime || 0,
              )}/{
                secondsToHms(
                  isCurrent ? player.duration : video.duration || 0,
                )
              }
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
