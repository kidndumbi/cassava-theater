import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import theme from "../../theme";
import AddIcon from "@mui/icons-material/Add";
import AppIconButton from "../common/AppIconButton";
import RefreshIcon from "@mui/icons-material/Refresh";
import { AppModal } from "../common/AppModal";
import { AppButton } from "../common/AppButton";
import { AppTextField } from "../common/AppTextField";
import { useMutation } from "@tanstack/react-query";
import { v4 as uuidv4 } from "uuid";
import { PlaylistModel } from "../../../models/playlist.model";
import { usePlaylists } from "../../hooks/usePlaylists";

// Title helper moved outside component
const Title = (value: string) => (
  <Typography
    variant="h6"
    gutterBottom
    sx={{
      color: theme.customVariables.appWhiteSmoke,
      fontWeight: "bold",
    }}
  >
    {value}
  </Typography>
);

// Toolbar extracted for clarity
const PlaylistsToolbar = ({
  onRefresh,
  isLoading,
  onAdd,
}: {
  onRefresh: () => void;
  isLoading: boolean;
  onAdd: () => void;
}) => (
  <Box className="flex gap-2 pb-5">
    <AppIconButton tooltip="Refresh" onClick={onRefresh} disabled={isLoading}>
      <RefreshIcon />
    </AppIconButton>
    <AppIconButton tooltip="Add new playlist" onClick={onAdd}>
      <AddIcon />
    </AppIconButton>
  </Box>
);

export const PlaylistsPage = () => {
  const { data: playlists, refetch } = usePlaylists();



  const { mutate: createNewPlaylist } = useMutation({
    mutationFn: (name: string) => {
      const newPlaylist: PlaylistModel = {
        id: uuidv4(),
        name,
        videos: [],
        createdAt: new Date().toISOString(),
      };
      return window.playlistAPI.putPlaylist(newPlaylist.id, newPlaylist);
    },
    onSuccess: () => {
      refetch();
    },
  });

  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(
    null,
  );

  const [open, setOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  useEffect(() => {
    console.log("selectedPlaylistId", selectedPlaylistId);
  }, [selectedPlaylistId]);

  const handleAddPlaylist = () => {
    setOpen(true);
  };

  const handleCreatePlaylist = () => {
    console.log("Create playlist:", newPlaylistName);
    createNewPlaylist(newPlaylistName);
    setNewPlaylistName("");
    setOpen(false);
  };

  return (
    <>
      <Box className="custom-scrollbar mr-5 overflow-y-auto pt-5">
        <PlaylistsToolbar
          onRefresh={() => refetch()}
          isLoading={false}
          onAdd={handleAddPlaylist}
        />
        {Title("Playlists")}
        <Box display="flex" gap={2} mt={2}>
          <Paper sx={{ minWidth: 220, maxWidth: 300, flex: "0 0 220px" }}>
            <List>
              {playlists?.map((playlist) => (
                <ListItem key={playlist.id} disablePadding>
                  <ListItemButton
                    selected={selectedPlaylistId === playlist.id}
                    onClick={() => setSelectedPlaylistId(playlist.id)}
                  >
                    <ListItemText primary={playlist.name} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>
          {/* Right: Videos in Playlist (empty for now) */}
          <Paper sx={{ flex: 1, minHeight: 300, p: 2 }}>
            {/* Videos will be shown here */}
          </Paper>
        </Box>
      </Box>
      <AppModal
        open={open}
        onClose={() => {
          setOpen(false);
          setNewPlaylistName("");
        }}
        title="New Playlist"
        fullScreen={false}
      >
        <Box className="flex flex-col gap-2 p-4">
          <AppTextField
            label="Playlist Name"
            value={newPlaylistName}
            onChange={(e) => setNewPlaylistName(e.target.value)}
            theme={theme}
          />
          <AppButton
            disabled={!newPlaylistName.trim()}
            color="primary"
            onClick={handleCreatePlaylist}
          >
            Create
          </AppButton>
        </Box>
      </AppModal>
    </>
  );
};
