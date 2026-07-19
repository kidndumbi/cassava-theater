import { contextBridge, ipcRenderer } from "electron";
import { VideoIPCChannels } from "../enums/VideoIPCChannels";
import { VideoDataModel } from "../models/videoData.model";
import { TvShowDetails } from "../models/tv-show-details.model";
import { SetPlayingModel } from "../models/set-playing.model";
import { PlaylistPlayRequestModel } from "../models/playlistPlayRequest.model";
import { VideoCommands } from "../models/video-commands.model";

export function exposeVideoApi() {
  contextBridge.exposeInMainWorld("videoCommandsAPI", {
    videoCommand: (callback: (command: VideoCommands) => void) => {
      ipcRenderer.on("video-command", (_event, command: VideoCommands) => callback(command));
    },
    setCurrentVideo: (callback: (data: SetPlayingModel) => void) => {
      ipcRenderer.on("set-current-video", (_event, data: SetPlayingModel) => callback(data));
    },
    setCurrentPlaylist: (callback: (data: PlaylistPlayRequestModel) => void) => {
      ipcRenderer.on("set-current-playlist", (_event, data: PlaylistPlayRequestModel) => callback(data));
    },
  });

  contextBridge.exposeInMainWorld("videoAPI", {
    fetchVideoData: (args: { filePath: string; includeThumbnail: boolean }) =>
      ipcRenderer.invoke(VideoIPCChannels.FetchVideoData, args),
    fetchVideoDetails: (args: { path: string; category: string }) =>
      ipcRenderer.invoke(VideoIPCChannels.FetchVideoDetails, args),
    fetchFolderDetails: (args: { path: string }) =>
      ipcRenderer.invoke(VideoIPCChannels.FetchFolderDetails, args),
    saveVideoDbCurrentTime: (args: { currentVideo: VideoDataModel; currentTime: number; isEpisode?: boolean }) =>
      ipcRenderer.invoke(VideoIPCChannels.SaveCurrentTime, args),
    getVideoJsonData: (currentVideo: VideoDataModel) =>
      ipcRenderer.invoke(VideoIPCChannels.GetVideoJsonData, currentVideo),
    saveVideoJsonData: (args: { currentVideo: VideoDataModel; newVideoJsonData: VideoDataModel }) =>
      ipcRenderer.invoke(VideoIPCChannels.SaveVideoJsonData, args),
    AddTvShowFolder: (args: { tvShowName: string; subfolders: string[]; tvShowDetails: TvShowDetails | null; tvShowsFolderPath: string; poster: string; backdrop: string }) =>
      ipcRenderer.invoke(VideoIPCChannels.AddTvShowFolder, args),
    getFolderFiles: (folderPath: string) =>
      ipcRenderer.invoke(VideoIPCChannels.GetFolderFiles, folderPath),
    getScreenshot: (videoData: VideoDataModel) =>
      ipcRenderer.invoke(VideoIPCChannels.GetScreenshot, videoData),
    fetchRecentlyWatchedVideosData: (args: { videoType: "movies" | "tvShows"; limit?: number }) =>
      ipcRenderer.invoke(VideoIPCChannels.FetchRecentlyWatchedVideosData, args),
    fetchRecentlyWatchedCustomVideosData: (args: { limit?: number }) =>
      ipcRenderer.invoke(VideoIPCChannels.FetchRecentlyWatchedCustomVideosData, args),
    fetchWatchlaterVideos: () =>
      ipcRenderer.invoke(VideoIPCChannels.FetchWatchlaterVideos),
  });
}