import { Box, Typography } from "@mui/material";
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import theme from "../../theme";
import { AppModal } from "../common/AppModal";
import { AppButton } from "../common/AppButton";
import { AppTextField } from "../common/AppTextField";
import { v4 as uuidv4 } from "uuid";
import { PlaylistModel } from "../../../models/playlist.model";
import { usePlaylists } from "../../hooks/usePlaylists";
import { useMutation } from "@tanstack/react-query";
import { VideoDataModel } from "../../../models/videoData.model";
import { useTmdbImageUrl } from "../../hooks/useImageUrl";
import { getUrl } from "../../util/helperFunctions";
import { useGetAllSettings } from "../../hooks/settings/useGetAllSettings";
import { PlaylistVideosPanel } from "./PlaylistVideosPanel";
import { PlaylistListPanel } from "./PlaylistListPanel";
import { PlaylistsToolbar } from "./PlaylistsToolbar";
import { SelectedPlaylistToolbar } from "./SelectedPlaylistToolbar";
import { useConfirmation } from "../../contexts/ConfirmationContext";
import { useGetPlaylistVideoData } from "../../hooks/useGetPlaylistVideoData";
import { useVideoListLogic } from "../../hooks/useVideoListLogic";
import { useModalState } from "../../hooks/useModalState";
import { useUpdatePlaylist } from "../../hooks/useUpdatePlaylist";

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

export const PlaylistsPage = ({ menuId }: { menuId: string }) => {
  const navigate = useNavigate();
  const { data: settings } = useGetAllSettings();
  const { data: playlists, refetch } = usePlaylists();
  const { setCurrentVideo } = useVideoListLogic();
  const { getTmdbImageUrl } = useTmdbImageUrl();

  const [selectedPlaylist, setSelectedPlaylist] =
    useState<PlaylistModel | null>(null);
  const { data: selectedPlaylistVideos } =
    useGetPlaylistVideoData(selectedPlaylist);

  // Modal states
  const newPlaylistModal = useModalState();
  const renameModal = useModalState();

  // Text field states
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [renameValue, setRenameValue] = useState("");

  // Mutations
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

  const { mutate: updatePlaylist } = useUpdatePlaylist((_, variables) => {
    setSelectedPlaylist((prev) =>
      prev && prev.id === variables.playlist.id
        ? { ...variables.playlist }
        : prev,
    );
    refetch();
  });

  const { openDialog, setMessage } = useConfirmation();

  const { mutate: deletePlaylist } = useMutation({
    mutationFn: (id: string) => window.playlistAPI.deletePlaylist(id),
    onSuccess: () => {
      refetch();
      setSelectedPlaylist(null);
    },
  });

  // Handlers
  const handleAddPlaylist = newPlaylistModal.openModal;

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) return;
    createNewPlaylist(newPlaylistName.trim());
    setNewPlaylistName("");
    newPlaylistModal.closeModal();
  };

  const handleDeletePlaylist = async () => {
    if (!selectedPlaylist) return;
    setMessage(
      `Are you sure you want to delete the playlist "${selectedPlaylist.name}"?`,
    );
    const decision = await openDialog("Delete");
    if (decision === "Ok") {
      deletePlaylist(selectedPlaylist.id);
    }
  };

  const handleRenamePlaylist = () => {
    if (!selectedPlaylist) return;
    setRenameValue(selectedPlaylist.name);
    renameModal.openModal();
  };

  const handleRenameSubmit = () => {
    if (!selectedPlaylist || !renameValue.trim()) return;
    const updated = { ...selectedPlaylist, name: renameValue.trim() };
    updatePlaylist({ id: updated.id, playlist: updated });
    renameModal.closeModal();
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

  // Helper to play a video (by index or random)
  const playVideoFromPlaylist = (videoIndex?: number, shuffle = false) => {
    if (!selectedPlaylist || !selectedPlaylistVideos.length) return;
    const idx =
      typeof videoIndex === "number"
        ? videoIndex
        : Math.floor(Math.random() * selectedPlaylistVideos.length);
    const video = selectedPlaylistVideos[idx];
    setCurrentVideo(video);
    updatePlaylist({
      id: selectedPlaylist.id,
      playlist: {
        ...selectedPlaylist,
        lastVideoPlayed: video.filePath,
        lastVideoPlayedDate: new Date().toISOString(),
      },
    });
    let url = `/video-player?menuId=${menuId}&playlistId=${selectedPlaylist.id}`;
    if (shuffle) {
      url += `&shuffle=true`;
    }
    navigate(url);
  };

  return (
    <>
      <Box className="custom-scrollbar mr-5 overflow-y-auto pt-5">
        <PlaylistsToolbar onAdd={handleAddPlaylist} />
        {Title("Playlists")}
        <Box display="flex" gap={2} mt={2}>
          <PlaylistListPanel
            playlists={playlists}
            selectedPlaylist={selectedPlaylist}
            setSelectedPlaylist={setSelectedPlaylist}
          />
          <Box>
            {selectedPlaylist && (
              <SelectedPlaylistToolbar
                playlist={selectedPlaylist}
                onRename={handleRenamePlaylist}
                onDelete={handleDeletePlaylist}
                onPlayFromBeginning={() => playVideoFromPlaylist(0)}
                onPlayFromLastWatched={() =>
                  playVideoFromPlaylist(
                    selectedPlaylistVideos.findIndex(
                      (video) =>
                        video.filePath === selectedPlaylist.lastVideoPlayed,
                    ),
                  )
                }
                onShuffle={() => playVideoFromPlaylist(undefined, true)}
              />
            )}
            <PlaylistVideosPanel
              videos={selectedPlaylistVideos}
              getImageUrl={getImageUrl}
              selectedPlaylist={selectedPlaylist}
              updatePlaylist={(id: string, playlist: PlaylistModel) =>
                updatePlaylist({ id, playlist })
              }
              navToDetails={(videoPath: string) => {
                navigate(
                  `/video-details?videoPath=${videoPath}&menuId=${menuId}`,
                );
              }}
              onPlayVideo={(videoIndex: number) => {
                playVideoFromPlaylist(videoIndex);
              }}
            />
          </Box>
        </Box>
      </Box>
      {/* Rename Playlist Modal */}
      <AppModal
        open={renameModal.open}
        onClose={renameModal.closeModal}
        title="Rename Playlist"
        fullScreen={false}
      >
        <Box className="flex flex-col gap-2 p-4">
          <AppTextField
            label="Playlist Name"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            theme={theme}
          />
          <AppButton
            disabled={!renameValue.trim()}
            color="primary"
            onClick={handleRenameSubmit}
          >
            Save
          </AppButton>
        </Box>
      </AppModal>
      {/* New Playlist Modal */}
      <AppModal
        open={newPlaylistModal.open}
        onClose={() => {
          newPlaylistModal.closeModal();
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
