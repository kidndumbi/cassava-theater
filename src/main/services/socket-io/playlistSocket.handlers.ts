import { AppSocketEvents } from "../../../enums/app-socket-events.enum";
import { PlaylistModel } from "../../../models/playlist.model";
import { PlaylistCommands } from "../../../models/playlist-commands.model";
import { PlaylistPlayRequestModel } from "../../../models/playlistPlayRequest.model";
import * as playlistDbService from "../playlistDb.service";
import { loggingService as log } from "../main-logging.service";
import { Socket } from "socket.io/dist";
import { BrowserWindow } from "electron";
import { KeyType } from "../levelDB.service";

export function registerPlaylistHandlers(
  socket: Socket,
  mainWindow: BrowserWindow,
) {
  socket.on(
    AppSocketEvents.SET_PLAYING_PLAYLIST,
    (data: PlaylistPlayRequestModel) => {
      mainWindow.webContents.send("set-current-playlist", data);
    },
  );

  socket.on(
    AppSocketEvents.PLAYLIST_REMOTE_COMMAND,
    (command: PlaylistCommands) => {
      mainWindow.webContents.send(
        AppSocketEvents.PLAYLIST_REMOTE_COMMAND,
        command,
      );
    },
  );

  socket.on(
    AppSocketEvents.GET_ALL_PLAYLISTS,
    async (
      _requestData: unknown,
      callback: (response: {
        success: boolean;
        data?: PlaylistModel[];
        error?: string;
      }) => void,
    ) => {
      try {
        const playlists = await playlistDbService.getAllPlaylists();
        callback({ success: true, data: playlists });
      } catch (error) {
        log.error("Error fetching playlists:", error);
        callback({ success: false, error: "Failed to fetch playlists" });
      }
    },
  );

  socket.on(
    AppSocketEvents.UPDATE_PLAYLIST,
    async (
      requestData: {
        data: {
          id: KeyType;
          playlist: PlaylistModel;
        };
      },
      callback: (response: {
        success: boolean;
        data?: PlaylistModel;
        error?: string;
      }) => void,
    ) => {
      try {
        await playlistDbService.putPlaylist(
          requestData.data.id,
          requestData.data.playlist,
        );
        const playlist = await playlistDbService.getPlaylist(
          requestData.data.id,
        );
        callback({ success: true, data: playlist });
      } catch (error) {
        log.error("Error fetching playlists:", error);
        callback({ success: false, error: "Failed to fetch playlists" });
      }
    },
  );

  socket.on(
    AppSocketEvents.DELETE_PLAYLIST,
    async (
      requestData: {
        data: {
          id: KeyType;
        };
      },
      callback: (response: {
        success: boolean;
        data?: PlaylistModel[];
        error?: string;
      }) => void,
    ) => {
      try {
        await playlistDbService.deletePlaylist(requestData.data.id);
        const playlists = await playlistDbService.getAllPlaylists();
        callback({ success: true, data: playlists });
      } catch (error) {
        log.error("Error fetching playlists:", error);
        callback({ success: false, error: "Failed to fetch playlists" });
      }
    },
  );
}
