import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Paper,
  ListItemButton, // <-- add this import
} from "@mui/material";
import theme from "../../theme";
import { removeVidExt } from "../../util/helperFunctions";
import { VideoDataModel } from "../../../models/videoData.model";
import { PlaylistModel } from "../../../models/playlist.model";

type PlaylistDrawerPanelProps = {
  playlist?: PlaylistModel;
  playlistVideos?: VideoDataModel[];
  currentVideo?: VideoDataModel | null;
  onPlayVideo: (video: VideoDataModel) => void;
};

export const PlaylistDrawerPanel = ({
  playlist,
  playlistVideos,
  currentVideo,
  onPlayVideo,
}: PlaylistDrawerPanelProps) => (
  <Box sx={{ width: 350, p: 2 }}>
    <Typography variant="h6" gutterBottom>
      {playlist?.name || "Playlist"}
    </Typography>
    <List>
      {playlistVideos?.map((video, idx) => {
        const isCurrent =
          currentVideo?.filePath && video?.filePath === currentVideo.filePath;
        return (
          <Paper
            key={video?.filePath || idx}
            sx={{
              mb: 1,
              backgroundColor: isCurrent
                ? theme.palette.primary.main
                : theme.customVariables.appDark,
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
      })}
      {!playlistVideos?.length && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          No videos in this playlist.
        </Typography>
      )}
    </List>
  </Box>
);
