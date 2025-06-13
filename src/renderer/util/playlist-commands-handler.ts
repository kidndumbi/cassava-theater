import { VideoDataModel } from "../../models/videoData.model";
import { PlaylistCommands } from "../../models/playlist-commands.model";

export const playlistCommandsHandler = (
  command: PlaylistCommands,
  next: (video: VideoDataModel) => void,
  previous: (video: VideoDataModel) => void,
) => {
  switch (command) {
    case "next":
      {
        window.currentlyPlayingAPI.getNextPlaylistVideo().then((nextVideo) => {
          if (nextVideo) {
            next(nextVideo);
          }
        });
      }
      break;
    case "previous":
      {
        window.currentlyPlayingAPI
          .getPreviousPlaylistVideo()
          .then((previousVideo) => {
            if (previousVideo) {
              previous(previousVideo);
            }
          });
      }

      break;
    default:
      console.error(`Unknown playlist command: ${command}`);
      break;
  }
};
