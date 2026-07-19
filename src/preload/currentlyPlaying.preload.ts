import { contextBridge, ipcRenderer } from "electron";
import { CurrentlyPlayingIPCChannels } from "../enums/currently-playing-IPCChannels.enum";
import { VideoDataModel } from "../models/videoData.model";
import { PlaylistModel } from "../models/playlist.model";

export function exposeCurrentlyPlayingApi() {
  contextBridge.exposeInMainWorld("currentlyPlayingAPI", {
    setCurrentVideo: (video: VideoDataModel) =>
      ipcRenderer.invoke(CurrentlyPlayingIPCChannels.SetCurrentVideo, video),
    setCurrentPlaylist: (args: { playlist: Partial<PlaylistModel>; shuffle?: boolean }) =>
      ipcRenderer.invoke(CurrentlyPlayingIPCChannels.SetCurrentPlaylist, args),
    setCurrentTime: (currentTime: number) =>
      ipcRenderer.invoke(CurrentlyPlayingIPCChannels.SET_CURRENTLY_PLAYING_CURRENTTIME, currentTime),
    getCurrentPlaylist: () =>
      ipcRenderer.invoke(CurrentlyPlayingIPCChannels.GetCurrentPlaylist),
    getPlaylistVideos: () =>
      ipcRenderer.invoke(CurrentlyPlayingIPCChannels.GetPlaylistVideos),
    getNextPlaylistVideo: () =>
      ipcRenderer.invoke(CurrentlyPlayingIPCChannels.GetNextPlaylistVideo),
    getPreviousPlaylistVideo: () =>
      ipcRenderer.invoke(CurrentlyPlayingIPCChannels.GetPreviousPlaylistVideo),
    getCurrentVideo: () =>
      ipcRenderer.invoke(CurrentlyPlayingIPCChannels.GetCurrentVideo),
  });
}