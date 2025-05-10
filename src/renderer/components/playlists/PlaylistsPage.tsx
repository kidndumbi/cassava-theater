import { Box, Typography } from "@mui/material";
import { useEffect, useState, useCallback } from "react";
import theme from "../../theme";
import AddIcon from "@mui/icons-material/Add";
import AppIconButton from "../common/AppIconButton";
import RefreshIcon from "@mui/icons-material/Refresh";
import { AppModal } from "../common/AppModal";
import { AppButton } from "../common/AppButton";
import { AppTextField } from "../common/AppTextField";
import { v4 as uuidv4 } from "uuid";
import { PlaylistModel } from "../../../models/playlist.model";
import { usePlaylists } from "../../hooks/usePlaylists";
import { useQueries, useMutation } from "@tanstack/react-query";
import { VideoDataModel } from "../../../models/videoData.model";
import { useTmdbImageUrl } from "../../hooks/useImageUrl";
import { getUrl } from "../../util/helperFunctions";
import { useGetAllSettings } from "../../hooks/settings/useGetAllSettings";
import { PlaylistVideosPanel } from "./PlaylistVideosPanel";
import { PlaylistListPanel } from "./PlaylistListPanel";

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
  // onRefresh,
  isLoading,
  onAdd,
}: {
  // onRefresh: () => void;
  isLoading: boolean;
  onAdd: () => void;
}) => (
  <Box className="flex gap-2 pb-5">
    {/* <AppIconButton tooltip="Refresh" onClick={onRefresh} disabled={isLoading}>
      <RefreshIcon />
    </AppIconButton> */}
    <AppIconButton tooltip="Add new playlist" onClick={onAdd}>
      <AddIcon />
    </AppIconButton>
  </Box>
);

export const PlaylistsPage = () => {
  const { data: settings } = useGetAllSettings();
  const { data: playlists, refetch } = usePlaylists();

  const { getTmdbImageUrl } = useTmdbImageUrl();

  // Store the entire selected playlist object, not just the id
  const [selectedPlaylist, setSelectedPlaylist] =
    useState<PlaylistModel | null>(null);

  // Only call .map if selectedPlaylist?.videos is an array
  const { data: selectedPlaylistVideos } = useQueries({
    queries: Array.isArray(selectedPlaylist?.videos)
      ? selectedPlaylist.videos.map((filepath) => ({
          queryKey: ["videoDetails", filepath, "movies"],
          queryFn: () =>
            window.videoAPI.fetchVideoDetails({
              path: filepath,
              category: "movies",
            }),
          enabled: !!selectedPlaylist,
        }))
      : [],
    combine: (results) => {
      return {
        data: results.map((result) => result.data),
        pending: results.some((result) => result.isPending),
      };
    },
  });

  useEffect(() => {
    console.log("Playlist videos:", selectedPlaylistVideos);
  }, [selectedPlaylistVideos]);

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

  const { mutate: updatePlaylist } = useMutation({
    mutationFn: (args: { id: string; playlist: PlaylistModel }) => {
      return window.playlistAPI.putPlaylist(args.playlist.id, args.playlist);
    },
    onSuccess: (_, variables) => {
      setSelectedPlaylist((prev) =>
        prev && prev.id === variables.playlist.id
          ? { ...variables.playlist }
          : prev,
      );
    },
  });
  const [open, setOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");

  useEffect(() => {
    console.log("selectedPlaylist", selectedPlaylist);
  }, [selectedPlaylist]);

  const handleAddPlaylist = () => {
    setOpen(true);
  };

  const handleCreatePlaylist = () => {
    console.log("Create playlist:", newPlaylistName);
    createNewPlaylist(newPlaylistName);
    setNewPlaylistName("");
    setOpen(false);
  };

  const getImageUrl = useCallback(
    (movie: VideoDataModel) => {
      if (movie?.poster) {
        return getUrl("file", movie.poster, null, settings?.port);
      }
      if (movie?.movie_details?.poster_path) {
        return getTmdbImageUrl(movie.movie_details.poster_path);
      }
    },
    [getTmdbImageUrl, settings?.port],
  );

  return (
    <>
      <Box className="custom-scrollbar mr-5 overflow-y-auto pt-5">
        <PlaylistsToolbar
          // onRefresh={() => refetch()}
          isLoading={false}
          onAdd={handleAddPlaylist}
        />
        {Title("Playlists")}
        <Box display="flex" gap={2} mt={2}>
          <PlaylistListPanel
            playlists={playlists}
            selectedPlaylist={selectedPlaylist}
            setSelectedPlaylist={setSelectedPlaylist}
          />
          <Box>
            <PlaylistVideosPanel
              videos={selectedPlaylistVideos}
              getImageUrl={getImageUrl}
              selectedPlaylist={selectedPlaylist}
              updatePlaylist={(id: string, playlist: PlaylistModel) =>
                updatePlaylist({ id, playlist })
              }
            />
          </Box>
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
