import { PlaylistCommands } from "../../models/playlist-commands.model";
import { VideoPlayerPageHandle } from "../pages/video-player-page/VideoPlayerPage";

export const playlistCommandsHandler = (
  command: PlaylistCommands,
  videoPlayerPageHandle: VideoPlayerPageHandle,
) => {
  switch (command) {
    case "next":
      if (videoPlayerPageHandle) {
        videoPlayerPageHandle.handleNextPlaylistVideo();
      }

      break;
    case "previous":
      if (videoPlayerPageHandle) {
        videoPlayerPageHandle.handlePreviousPlaylistVideo();
      }

      break;
    default:
      console.error(`Unknown playlist command: ${command}`);
      break;
  }
};
