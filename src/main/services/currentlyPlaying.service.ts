import { PlaylistModel } from "../../models/playlist.model";
import { VideoDataModel } from "../../models/videoData.model";

class CurrentlyPlayingService {
  private currentVideo: VideoDataModel | null = null;
  private currentPlaylist: PlaylistModel | null = null;

  setCurrentVideo(video: VideoDataModel): void {
    this.currentVideo = video;
  }
  getCurrentVideo(): VideoDataModel | null {
    return this.currentVideo;
  }
  setCurrentPlaylist(playlist: PlaylistModel): void {
    this.currentPlaylist = playlist;
  }
  getCurrentPlaylist(): PlaylistModel | null {
    return this.currentPlaylist;
  }
}

let CurrentlyPlayingServiceInstance: CurrentlyPlayingService | null = null;

export function getCurrentlyPlayingInstance() {
  if (!CurrentlyPlayingServiceInstance) {
    CurrentlyPlayingServiceInstance = new CurrentlyPlayingService();
  }
  return CurrentlyPlayingServiceInstance;
}
