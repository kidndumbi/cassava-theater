import { AppSocketEvents } from "../../../enums/app-socket-events.enum";
import { getCurrentlyPlayingInstance } from "../currentlyPlaying.service";
import { VideoDataModel } from "../../../models/videoData.model";
import { PlaylistModel } from "../../../models/playlist.model";
import { Socket } from "socket.io";

export function registerCurrentlyPlayingHandlers(socket: Socket) {
  socket.on(
    AppSocketEvents.GET_CURRENT_VIDEO,
    async (
      _requestData: unknown,
      callback: (response: {
        success: boolean;
        data?: VideoDataModel | null;
        error?: string;
      }) => void,
    ) => {
      try {
        const data = getCurrentlyPlayingInstance().getCurrentVideo();
        callback({ success: true, data });
      } catch (error) {
        callback({ success: false, error: (error as Error).message });
      }
    },
  );

  socket.on(
    AppSocketEvents.GET_CURRENT_PLAYLIST,
    async (
      _requestData: unknown,
      callback: (response: {
        success: boolean;
        data?: Partial<PlaylistModel> | null;
        error?: string;
      }) => void,
    ) => {
      try {
        const data = getCurrentlyPlayingInstance().getCurrentPlaylist();
        callback({ success: true, data });
      } catch (error) {
        callback({ success: false, error: (error as Error).message });
      }
    },
  );
}
