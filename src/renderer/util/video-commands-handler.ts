import { rendererLoggingService as log } from "../util/renderer-logging.service";
import { VideoCommands } from "../../models/video-commands.model";

export const videoCommandsHandler = (
  player: HTMLVideoElement,
  command: VideoCommands
) => {
  switch (command) {
    case "play":
      player.play();
      break;
    case "pause":
      player.pause();
      break;
    case "forward30":
      player.currentTime += 30;
      break;
    case "backward10":
      player.currentTime -= 10;
      break;
    case "restart":
      player.currentTime = 0;
      break;
    case "volumeDown":
      player.volume = Math.max(player.volume - 0.1, 0);
      break;
    case "volumeUp":
      player.volume = Math.min(player.volume + 0.1, 1);
      break;
    default:
      log.error(`Unknown command: ${command}`);
  }
};
