import { AppVideoPlayerHandle } from "./../components/video-player/AppVideoPlayer";
import { rendererLoggingService as log } from "../util/renderer-logging.service";
import { VideoCommands } from "../../models/video-commands.model";

export const videoCommandsHandler = (
  command: VideoCommands,
  player: AppVideoPlayerHandle | null
) => {
  switch (command) {
    case "play":
      player.play();
      break;
    case "pause":
      player.pause();
      break;
    case "forward30":
      player?.skipBy(30);
      break;
    case "backward10":
      player?.skipBy(-10);
      break;
    case "restart":
      player?.startPlayingAt(0);
      break;
    case "volumeDown":
      player?.setVolume((prev) => Math.max(prev - 0.1, 0));

      break;
    case "volumeUp":
      player?.setVolume((prev) => Math.min(prev + 0.1, 1));
      break;
    default:
      log.error(`Unknown command: ${command}`);
  }
};
