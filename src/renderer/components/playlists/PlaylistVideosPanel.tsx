import * as React from "react";
import { Paper, Box, Typography } from "@mui/material";
import theme from "../../theme";
import { PosterCard } from "../common/PosterCard";
import { trimFileName } from "../../util/helperFunctions";
import { VideoDataModel } from "../../../models/videoData.model";
import { PlaylistModel } from "../../../models/playlist.model";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

interface PlaylistVideosPanelProps {
  videos: VideoDataModel[] | undefined;
  getImageUrl: (video: VideoDataModel) => string | undefined;
  selectedPlaylist: PlaylistModel | null;
  updatePlaylist: (id: string, playlist: PlaylistModel) => void;
}

export const PlaylistVideosPanel: React.FC<PlaylistVideosPanelProps> = ({
  videos,
  getImageUrl,
  selectedPlaylist,
  updatePlaylist,
}) => {
  const [contextMenu, setContextMenu] = React.useState<{
    mouseX: number;
    mouseY: number;
    videoIdx: number | null;
  } | null>(null);

  const handleContextMenu = (event: React.MouseEvent, idx: number) => {
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
            videoIdx: idx,
          }
        : null,
    );
  };

  const handleClose = () => {
    setContextMenu(null);
  };

  // Remove video from playlist
  const handleRemove = () => {
    if (
      contextMenu &&
      typeof contextMenu.videoIdx === "number" &&
      selectedPlaylist &&
      Array.isArray(selectedPlaylist.videos)
    ) {
      const videoToRemove = videos?.[contextMenu.videoIdx];
      if (videoToRemove?.filePath) {
        const updated = {
          ...selectedPlaylist,
          videos: selectedPlaylist.videos.filter(
            (fp) => fp !== videoToRemove.filePath,
          ),
        };
        updatePlaylist(updated.id, updated);
      }
    }
    handleClose();
  };

  return (
    <Paper
      sx={{
        flex: 1,
        minHeight: 300,
        p: 2,
        backgroundColor: theme.customVariables.appDarker,
        color: theme.customVariables.appWhiteSmoke,
      }}
    >
      <Box display="flex" flexWrap="wrap" gap={2}>
        {videos?.length > 0 ? (
          videos.map((video, idx) =>
            video ? (
              <div
                key={video.filePath || idx}
                onContextMenu={(e) => handleContextMenu(e, idx)}
                style={{ cursor: "context-menu" }}
              >
                <PosterCard
                  imageUrl={getImageUrl(video)}
                  altText={video.fileName || ""}
                  footer={trimFileName(video.fileName || "")}
                />
              </div>
            ) : null,
          )
        ) : (
          <Typography sx={{ color: theme.customVariables.appWhiteSmoke }}>
            {selectedPlaylist
              ? "No videos in this playlist."
              : "Select a playlist to view its videos."}
          </Typography>
        )}
        <Menu
          open={contextMenu !== null}
          onClose={handleClose}
          anchorReference="anchorPosition"
          anchorPosition={
            contextMenu !== null
              ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
              : undefined
          }
        >
          <MenuItem onClick={handleRemove}>Remove</MenuItem>
        </Menu>
      </Box>
    </Paper>
  );
};
