import React from "react";
import {
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import theme from "../../theme";
import { PlaylistModel } from "../../../models/playlist.model";

interface PlaylistListPanelProps {
  playlists: PlaylistModel[] | undefined;
  selectedPlaylist: PlaylistModel | null;
  setSelectedPlaylist: (playlist: PlaylistModel) => void;

}

export const PlaylistListPanel: React.FC<PlaylistListPanelProps> = ({
  playlists,
  selectedPlaylist,
  setSelectedPlaylist,

}) => {
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
        ))}
      </List>
    </Paper>
  );
};
