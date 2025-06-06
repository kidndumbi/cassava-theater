import { AppSocketEvents } from "./../../enums/app-socket-events.enum";
import { PlaylistModel } from "../../models/playlist.model";
import { VideoDataModel } from "../../models/videoData.model";
import { getSocketIoGlobal } from "../socketGlobalManager";

class CurrentlyPlayingService {
  private currentVideo: VideoDataModel | null = null;
  private currentPlaylist: Partial<PlaylistModel> | null = null;

  setCurrentVideo(video: VideoDataModel): void {
    this.currentVideo = video;
    const socketIo = getSocketIoGlobal();
    if (socketIo) {
      socketIo.emit(AppSocketEvents.CURRENT_VIDEO, this.getCurrentVideo());
    }
  }
  getCurrentVideo(): VideoDataModel | null {
    return this.currentVideo;
  }
  setCurrentPlaylist(playlist: Partial<PlaylistModel>): void {
    this.currentPlaylist = !playlist ? playlist : {...this.currentPlaylist, ...playlist};
    const socketIo = getSocketIoGlobal();
    if (socketIo) {
      socketIo.emit(
        AppSocketEvents.CURRENT_PLAYLIST,
        this.getCurrentPlaylist(),
      );
    }
  }
  getCurrentPlaylist(): Partial<PlaylistModel> | null {
    return this.currentPlaylist;
  }

  setCurrentTime(currentTime: number) {
    const socketIo = getSocketIoGlobal();
    if (socketIo) {
      this.currentVideo.currentTime = currentTime;
      socketIo.emit(AppSocketEvents.CURRENTLY_PLAYING_CURRENTTIME, currentTime);
    }
  }
}

let CurrentlyPlayingServiceInstance: CurrentlyPlayingService | null = null;

export function getCurrentlyPlayingInstance() {
  if (!CurrentlyPlayingServiceInstance) {
    CurrentlyPlayingServiceInstance = new CurrentlyPlayingService();
  }
  return CurrentlyPlayingServiceInstance;
}
