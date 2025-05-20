import { PlaylistModel } from "./playlist.model";
import { VideoDataModel } from "./videoData.model";

export interface DragVideoItem {
  index: number;
  type: string;
  videoData: VideoDataModel;
  currentPlaylist:PlaylistModel
}