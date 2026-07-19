import { ipcMain, BrowserWindow } from "electron";
import { Socket } from "socket.io";
import { PlaylistIPCChannels } from "../../enums/playlist-IPC-Channels.enum";
import { AppSocketEvents } from "../../enums/app-socket-events.enum";
import { PlaylistModel } from "../../models/playlist.model";
import { PlaylistCommands } from "../../models/playlist-commands.model";
import { PlaylistPlayRequestModel } from "../../models/playlistPlayRequest.model";
import { KeyType } from "../services/levelDB.service";
import * as playlistDbService from "../services/playlistDb.service";
import { loggingService as log } from "../services/main-logging.service";

export const registerPlaylistHandlers = {
  ipc(): void {
    ipcMain.handle(PlaylistIPCChannels.GET_PLAYLIST, async (_event, id: string) => playlistDbService.getPlaylist(id));
    ipcMain.handle(PlaylistIPCChannels.GET_ALL_PLAYLISTS, async () => playlistDbService.getAllPlaylists());
    ipcMain.handle(PlaylistIPCChannels.PUT_PLAYLIST, async (_event, id: string, playlist: PlaylistModel) => { await playlistDbService.putPlaylist(id, playlist); return true; });
    ipcMain.handle(PlaylistIPCChannels.DELETE_PLAYLIST, async (_event, id: string) => { await playlistDbService.deletePlaylist(id); return true; });
  },

  socket(socket: Socket, mainWindow: BrowserWindow): void {
    socket.on(AppSocketEvents.SET_PLAYING_PLAYLIST, (data: PlaylistPlayRequestModel) => {
      mainWindow.webContents.send("set-current-playlist", data);
    });
    socket.on(AppSocketEvents.PLAYLIST_REMOTE_COMMAND, (command: PlaylistCommands) => {
      mainWindow.webContents.send(AppSocketEvents.PLAYLIST_REMOTE_COMMAND, command);
    });
    socket.on(AppSocketEvents.GET_ALL_PLAYLISTS, async (_req: unknown, callback: (r: { success: boolean; data?: PlaylistModel[]; error?: string }) => void) => {
      try {
        const playlists = await playlistDbService.getAllPlaylists();
        callback({ success: true, data: playlists });
      } catch (error) { log.error("Error fetching playlists:", error); callback({ success: false, error: "Failed to fetch playlists" }); }
    });
    socket.on(AppSocketEvents.UPDATE_PLAYLIST, async (requestData: { data: { id: KeyType; playlist: PlaylistModel } }, callback: (r: { success: boolean; data?: PlaylistModel; error?: string }) => void) => {
      try {
        await playlistDbService.putPlaylist(requestData.data.id, requestData.data.playlist);
        const playlist = await playlistDbService.getPlaylist(requestData.data.id);
        callback({ success: true, data: playlist ?? undefined });
      } catch (error) { log.error("Error updating playlist:", error); callback({ success: false, error: "Failed to update playlist" }); }
    });
    socket.on(AppSocketEvents.DELETE_PLAYLIST, async (requestData: { data: { id: KeyType } }, callback: (r: { success: boolean; data?: PlaylistModel[]; error?: string }) => void) => {
      try {
        await playlistDbService.deletePlaylist(requestData.data.id);
        const playlists = await playlistDbService.getAllPlaylists();
        callback({ success: true, data: playlists });
      } catch (error) { log.error("Error deleting playlist:", error); callback({ success: false, error: "Failed to delete playlist" }); }
    });
  },
};