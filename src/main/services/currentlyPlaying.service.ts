import { AppSocketEvents } from "./../../enums/app-socket-events.enum";
import { PlaylistModel } from "../../models/playlist.model";
import { VideoDataModel } from "../../models/videoData.model";
import { getSocketIoGlobal } from "../socketGlobalManager";
import { fetchVideoDetails } from "./video-data.service";

class CurrentlyPlayingService {
  private currentVideo: VideoDataModel | null = null;
  private currentPlaylist: Partial<PlaylistModel> | null = null;
  private videos: VideoDataModel[] = [];

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
  async setCurrentPlaylist(
    playlist: Partial<PlaylistModel | null>,
    shuffle?: boolean,
  ): Promise<PlaylistModel> {
    if (shuffle && playlist?.videos) {
      playlist.videos = this.shuffleVideos(playlist.videos);
    }
    this.currentPlaylist = !playlist
      ? playlist
      : { ...this.currentPlaylist, ...playlist };
    const socketIo = getSocketIoGlobal();
    if (socketIo) {
      socketIo.emit(
        AppSocketEvents.CURRENT_PLAYLIST,
        this.getCurrentPlaylist(),
      );
    }
    if (this.currentPlaylist?.videos?.length > 0) {
      await this.setVideosFromDb(this.currentPlaylist.videos);
    }
    return {
      ...this.currentPlaylist,
      videosDetails: this.videos,
    } as PlaylistModel;
  }
  getCurrentPlaylist(): Partial<PlaylistModel> | null {
    return this.currentPlaylist;
  }

  getPlaylistVideos(): VideoDataModel[] {
    return this.videos;
  }

  private async setVideosFromDb(videoPaths: string[]) {
    const videPromises = videoPaths.map((path) =>
      fetchVideoDetails(path, "movies"),
    );
    const videos = await Promise.all(videPromises);
    this.videos = videos;
  }

  getNextPlaylistVideo(): VideoDataModel | null {
    if (!this.currentPlaylist || !this.videos) {
      return null;
    }
    const currentIndex = this.videos.findIndex(
      (v) => v.filePath === this.currentVideo?.filePath,
    );
    if (currentIndex < 0 || currentIndex >= this.videos.length - 1) {
      return null;
    }
    return this.videos[currentIndex + 1];
  }

  getPreviousPlaylistVideo(): VideoDataModel | null {
    if (!this.currentPlaylist || !this.videos) {
      return null;
    }
    const currentIndex = this.videos.findIndex(
      (v) => v.filePath === this.currentVideo?.filePath,
    );
    if (currentIndex <= 0) {
      return null;
    }
    return this.videos[currentIndex - 1];
  }

  setCurrentTime(currentTime: number) {
    const socketIo = getSocketIoGlobal();
    if (socketIo) {
      this.currentVideo.currentTime = currentTime;
      socketIo.emit(AppSocketEvents.CURRENTLY_PLAYING_CURRENTTIME, currentTime);
    }
  }

  shuffleVideos(videos: string[]): string[] {
    for (let i = videos.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [videos[i], videos[j]] = [videos[j], videos[i]];
    }
    return videos;
  }
}

let CurrentlyPlayingServiceInstance: CurrentlyPlayingService | null = null;

export function getCurrentlyPlayingInstance() {
  if (!CurrentlyPlayingServiceInstance) {
    CurrentlyPlayingServiceInstance = new CurrentlyPlayingService();
  }
  return CurrentlyPlayingServiceInstance;
}
