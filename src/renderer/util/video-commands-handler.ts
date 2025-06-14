import { AppVideoPlayerHandle } from "./../components/video-player/AppVideoPlayer";
import { rendererLoggingService as log } from "../util/renderer-logging.service";
import { VideoCommands } from "../../models/video-commands.model";

export const videoCommandsHandler = (
  command: VideoCommands,
  playerHandle: AppVideoPlayerHandle | null,
) => {
  switch (command) {
    case "play":
      playerHandle?.play();
      break;
    case "pause":
      playerHandle?.pause();
      break;
    case "forward30":
      playerHandle?.skipBy(30);
      break;
    case "backward10":
      playerHandle?.skipBy(-10);
      break;
    case "restart":
      playerHandle?.startPlayingAt(0);
      break;
    case "volumeDown":
      playerHandle?.setVolume((prev) => Math.max(prev - 0.1, 0));

      break;
    case "volumeUp":
      playerHandle?.setVolume((prev) => Math.min(prev + 0.1, 1));
      break;
    case "nextEpisode":
      if (playerHandle && playerHandle?.triggereNextEpisode) {
        playerHandle.triggereNextEpisode();
      }
      break;
    case "speed-1":
    case "speed-1.25":
    case "speed-1.5":
    case "speed-1.75":
    case "speed-2": {
      const speed = parseFloat(command.split("-")[1]);
      playerHandle?.setPlaybackSpeed(speed);
      break;
    }
    default:
      log.error(`Unknown command: ${command}`);
  }
};
