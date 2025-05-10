import { ipcMain } from "electron";
import { PlaylistIPCChannels } from "../../enums/playlist-IPC-Channels.enum";
import {
  getPlaylist,
  getAllPlaylists,
  putPlaylist,
  deletePlaylist,
} from "../services/playlistDb.service";
import { PlaylistModel } from "../../models/playlist.model";

export const playlistIpcHandlers = () => {
  ipcMain.handle(
    PlaylistIPCChannels.GET_PLAYLIST,
    async (_event, id: string) => {
      return getPlaylist(id);
    },
  );

  ipcMain.handle(PlaylistIPCChannels.GET_ALL_PLAYLISTS, async () => {
    return getAllPlaylists();
  });

  ipcMain.handle(
    PlaylistIPCChannels.PUT_PLAYLIST,
    async (_event, id: string, playlist: PlaylistModel) => {
      await putPlaylist(id, playlist);
      return true;
    },
  );

  ipcMain.handle(
    PlaylistIPCChannels.DELETE_PLAYLIST,
    async (_event, id: string) => {
      await deletePlaylist(id);
      return true;
    },
  );
};
