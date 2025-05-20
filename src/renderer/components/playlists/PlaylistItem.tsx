import React from "react";
import { ListItem, ListItemButton, ListItemText } from "@mui/material";
import theme from "../../theme";
import { PlaylistModel } from "../../../models/playlist.model";
import { useDrop } from "react-dnd";
import { DragVideoItem } from "../../../models/drag-video-item.model";
import { VideoDataModel } from "../../../models/videoData.model";

interface PlaylistItemProps {
  playlist: PlaylistModel;
  selectedPlaylist: PlaylistModel;
  setSelectedPlaylist: (playlist: PlaylistModel) => void;
  moveVideo: (
    video: VideoDataModel,
    from: PlaylistModel,
    to: PlaylistModel,
  ) => void;
}

export const PlaylistItem: React.FC<PlaylistItemProps> = ({
  playlist,
  selectedPlaylist,
  setSelectedPlaylist,
  moveVideo,
}) => {
  const ref = React.useRef<HTMLDivElement>(null);

  const [{ isOver }, drop] = useDrop<DragVideoItem, void, { isOver: boolean }>({
    accept: "VIDEO",
    canDrop: () => selectedPlaylist.id !== playlist.id,
    drop(item) {
      moveVideo(item.videoData, item.currentPlaylist, playlist);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  });

  drop(ref);
  return (
    <div
      ref={ref}
      style={{
        borderBottom: isOver
          ? `2px solid ${theme.customVariables.appWhiteSmoke}`
          : undefined,
      }}
    >
      <ListItem key={playlist.id} disablePadding>
        <ListItemButton
          selected={selectedPlaylist?.id === playlist.id}
          onClick={() => setSelectedPlaylist(playlist)}
          sx={{
            color: theme.customVariables.appWhiteSmoke,
            "&.Mui-selected": {
              backgroundColor: theme.palette.primary.dark,
              color: theme.customVariables.appWhiteSmoke,
            },
            "&:hover": {
              backgroundColor: theme.palette.primary.light,
              color: theme.customVariables.appWhiteSmoke,
            },
          }}
        >
          <ListItemText
            primary={playlist.name}
            slotProps={{
              primary: {
                sx: { color: theme.customVariables.appWhiteSmoke },
              },
            }}
          />
        </ListItemButton>
      </ListItem>
    </div>
  );
};
