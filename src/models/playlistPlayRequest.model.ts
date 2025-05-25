import { PlaylistModel } from "./playlist.model";
import { VideoDataModel } from "./videoData.model";

export interface PlaylistPlayRequestModel {
  menuId: string;
  playlistId: string | null | undefined;
  shuffle: boolean;
  playIndex: number;
  video: VideoDataModel;
   playlist:PlaylistModel;
}
