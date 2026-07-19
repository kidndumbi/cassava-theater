import { contextBridge, ipcRenderer } from "electron";
import { PlaylistIPCChannels } from "../enums/playlist-IPC-Channels.enum";
import { PlaylistModel } from "../models/playlist.model";
import { PlaylistCommands } from "../models/playlist-commands.model";
import { AppSocketEvents } from "../enums/app-socket-events.enum";

export function exposePlaylistApi() {
  contextBridge.exposeInMainWorld("playlistCommandsAPI", {
    playlistVideoCommand: (callback: (command: PlaylistCommands) => void) => {
      ipcRenderer.on(AppSocketEvents.PLAYLIST_REMOTE_COMMAND, (_event, command: PlaylistCommands) => callback(command));
    },
  });

  contextBridge.exposeInMainWorld("playlistAPI", {
    getPlaylist: (id: string): Promise<PlaylistModel | null> =>
      ipcRenderer.invoke(PlaylistIPCChannels.GET_PLAYLIST, id),
    getAllPlaylists: (): Promise<PlaylistModel[]> =>
      ipcRenderer.invoke(PlaylistIPCChannels.GET_ALL_PLAYLISTS),
    putPlaylist: (id: string, playlist: PlaylistModel): Promise<boolean> =>
      ipcRenderer.invoke(PlaylistIPCChannels.PUT_PLAYLIST, id, playlist),
    deletePlaylist: (id: string): Promise<boolean> =>
      ipcRenderer.invoke(PlaylistIPCChannels.DELETE_PLAYLIST, id),
  });
}