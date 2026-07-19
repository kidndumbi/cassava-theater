import { ipcMain } from "electron";
import { Socket } from "socket.io";
import { CurrentlyPlayingIPCChannels } from "../../enums/currently-playing-IPCChannels.enum";
import { AppSocketEvents } from "../../enums/app-socket-events.enum";
import { getCurrentlyPlayingInstance } from "../services/currentlyPlaying.service";
import { VideoDataModel } from "../../models/videoData.model";
import { PlaylistModel } from "../../models/playlist.model";

export const registerCurrentlyPlayingHandlers = {
  ipc(): void {
    ipcMain.handle(CurrentlyPlayingIPCChannels.SetCurrentVideo, (_event, video: VideoDataModel) => {
      getCurrentlyPlayingInstance().setCurrentVideo(video);
      return true;
    });
    ipcMain.handle(CurrentlyPlayingIPCChannels.SetCurrentPlaylist, (_event, args: { playlist: Partial<PlaylistModel | null>; shuffle?: boolean }) => {
      return getCurrentlyPlayingInstance().setCurrentPlaylist(args?.playlist, args?.shuffle);
    });
    ipcMain.handle(CurrentlyPlayingIPCChannels.SET_CURRENTLY_PLAYING_CURRENTTIME, (_event, currentTime: number) => {
      getCurrentlyPlayingInstance().setCurrentTime(currentTime);
      return true;
    });
    ipcMain.handle(CurrentlyPlayingIPCChannels.GetCurrentPlaylist, () => getCurrentlyPlayingInstance().getCurrentPlaylist());
    ipcMain.handle(CurrentlyPlayingIPCChannels.GetPlaylistVideos, async () => getCurrentlyPlayingInstance().getPlaylistVideos());
    ipcMain.handle(CurrentlyPlayingIPCChannels.GetNextPlaylistVideo, () => getCurrentlyPlayingInstance().getNextPlaylistVideo());
    ipcMain.handle(CurrentlyPlayingIPCChannels.GetPreviousPlaylistVideo, () => getCurrentlyPlayingInstance().getPreviousPlaylistVideo());
    ipcMain.handle(CurrentlyPlayingIPCChannels.GetCurrentVideo, () => getCurrentlyPlayingInstance().getCurrentVideo());
  },

  socket(socket: Socket): void {
    socket.on(AppSocketEvents.GET_CURRENT_VIDEO, async (_req: unknown, callback: (r: { success: boolean; data?: VideoDataModel | null; error?: string }) => void) => {
      try {
        const data = getCurrentlyPlayingInstance().getCurrentVideo();
        callback({ success: true, data });
      } catch (error) {
        callback({ success: false, error: (error as Error).message });
      }
    });
    socket.on(AppSocketEvents.GET_CURRENT_PLAYLIST, async (_req: unknown, callback: (r: { success: boolean; data?: Partial<PlaylistModel> | null; error?: string }) => void) => {
      try {
        const data = getCurrentlyPlayingInstance().getCurrentPlaylist();
        callback({ success: true, data });
      } catch (error) {
        callback({ success: false, error: (error as Error).message });
      }
    });
  },
};