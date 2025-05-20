import React from "react";
import { Paper, List } from "@mui/material";
import theme from "../../theme";
import { PlaylistModel } from "../../../models/playlist.model";
import { VideoDataModel } from "../../../models/videoData.model";
import { PlaylistItem } from "./PlaylistItem";

interface PlaylistListPanelProps {
  playlists: PlaylistModel[] | undefined;
  selectedPlaylist: PlaylistModel | null;
  setSelectedPlaylist: (playlist: PlaylistModel) => void;
  updatePlaylist: (id: string, playlist: PlaylistModel) => void;
}

export const PlaylistListPanel: React.FC<PlaylistListPanelProps> = ({
  playlists,
  selectedPlaylist,
  setSelectedPlaylist,
  updatePlaylist,
}) => {
  const moveVideo = React.useCallback(
    (
      video: VideoDataModel,
      from: PlaylistModel,
      to: PlaylistModel,
    ) => {
      if (!from || !to || !video?.filePath) return;

      // Remove video from 'from' playlist
      const fromUpdated: PlaylistModel = {
        ...from,
        videos: from.videos.filter((fp) => fp !== video.filePath),
      };

      // Add video to 'to' playlist (if not already present)
      const toUpdated: PlaylistModel = {
        ...to,
        videos: to.videos.includes(video.filePath)
          ? to.videos
          : [...to.videos, video.filePath],
      };

      updatePlaylist(fromUpdated.id, fromUpdated);
      updatePlaylist(toUpdated.id, toUpdated);
    },
    [updatePlaylist]
  );

  return (
    <Paper
      sx={{
        minWidth: 220,
        maxWidth: 300,
        flex: "0 0 220px",
        backgroundColor: theme.palette.primary.main,
      }}
    >
      <List
        sx={{
          color: theme.customVariables.appWhiteSmoke,
          bgcolor: theme.palette.primary.main,
        }}
      >
        {playlists?.map((playlist) => (
          <PlaylistItem
            key={playlist.id}
            playlist={playlist}
            selectedPlaylist={selectedPlaylist}
            setSelectedPlaylist={setSelectedPlaylist}
            moveVideo={moveVideo}
          />
        ))}
      </List>
    </Paper>
  );
};
