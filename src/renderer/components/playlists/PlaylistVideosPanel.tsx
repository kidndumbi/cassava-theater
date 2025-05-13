import * as React from "react";
import { Paper, Box, Typography } from "@mui/material";
import theme from "../../theme";
import { PosterCard } from "../common/PosterCard";
import {
  getFilename,
  removeVidExt,
  trimFileName,
} from "../../util/helperFunctions";
import { VideoDataModel } from "../../../models/videoData.model";
import { PlaylistModel } from "../../../models/playlist.model";
import { AppContextMenu } from "../common/AppContextMenu";

interface PlaylistVideosPanelProps {
  videos: VideoDataModel[] | undefined;
  getImageUrl: (video: VideoDataModel) => string | undefined;
  selectedPlaylist: PlaylistModel | null;
  updatePlaylist: (id: string, playlist: PlaylistModel) => void;
  navToDetails: (videoPath: string) => void;
  onPlayVideo: (videoIndex: number) => void;
}

export const PlaylistVideosPanel: React.FC<PlaylistVideosPanelProps> = ({
  videos,
  getImageUrl,
  selectedPlaylist,
  updatePlaylist,
  navToDetails,
  onPlayVideo,
}) => {
  // Remove video from playlist
  const handleRemove = (videoIdx: number) => {
    if (
      typeof videoIdx === "number" &&
      selectedPlaylist &&
      Array.isArray(selectedPlaylist.videos)
    ) {
      const videoToRemove = videos?.[videoIdx];
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
  };

  const handleInfo = (videoIdx: number) => {
    if (typeof videoIdx === "number" && videos?.[videoIdx]) {
      navToDetails(videos[videoIdx].filePath);
    }
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
      {selectedPlaylist?.lastVideoPlayed && (
        <Typography sx={{ marginBottom: 2 }} variant="subtitle2">
          Last Played:{" "}
          {removeVidExt(getFilename(selectedPlaylist.lastVideoPlayed))}
        </Typography>
      )}
      <Box display="flex" flexWrap="wrap" gap={2}>
        {videos?.length > 0 ? (
          videos.map((video, idx) =>
            video ? (
              <AppContextMenu
                key={video.filePath || idx}
                title={removeVidExt(video.fileName)}
                menuItems={[
                  {
                    label: "Remove",
                    action: () => handleRemove(idx),
                  },
                  {
                    label: "Info",
                    action: () => handleInfo(idx),
                  },
                ]}
              >
                <div style={{ cursor: "context-menu" }}>
                  <PosterCard
                    imageUrl={getImageUrl(video)}
                    altText={video.fileName || ""}
                    footer={trimFileName(video.fileName || "")}
                    onClick={() => onPlayVideo(idx)}
                  />
                </div>
              </AppContextMenu>
            ) : null,
          )
        ) : (
          <Typography sx={{ color: theme.customVariables.appWhiteSmoke }}>
            {selectedPlaylist
              ? "No videos in this playlist."
              : "Select a playlist to view its videos."}
          </Typography>
        )}
      </Box>
    </Paper>
  );
};
