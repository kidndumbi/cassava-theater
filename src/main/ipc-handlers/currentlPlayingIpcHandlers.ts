import { ipcMain } from "electron";
import { CurrentlyPlayingIPCChannels } from "../../enums/currently-playing-IPCChannels.enum";
import { getCurrentlyPlayingInstance } from "../services/currentlyPlaying.service";
import { VideoDataModel } from "../../models/videoData.model";
import { PlaylistModel } from "../../models/playlist.model";

export const currentlPlayingIpcHandlers = () => { 
  ipcMain.handle(CurrentlyPlayingIPCChannels.SetCurrentVideo, (_event, video: VideoDataModel) => {
    getCurrentlyPlayingInstance().setCurrentVideo(video);
    return true;
  });

  ipcMain.handle(CurrentlyPlayingIPCChannels.SetCurrentPlaylist, (_event, playlist: PlaylistModel) => {
    getCurrentlyPlayingInstance().setCurrentPlaylist(playlist);
    return true;
  });

  ipcMain.handle(CurrentlyPlayingIPCChannels.SET_CURRENTLY_PLAYING_CURRENTTIME, (_event, currentTime: number) => {
    getCurrentlyPlayingInstance().setCurrentTime(currentTime);
    return true;
  });
}