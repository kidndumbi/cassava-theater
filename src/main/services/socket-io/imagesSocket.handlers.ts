import { Socket } from "socket.io";
import { loggingService as log } from "../main-logging.service";
import { AppSocketEvents } from "../../../enums/app-socket-events.enum";
import { imagePathToDisplayable } from "../image.service";

export function registerImagesSocketHandlers(socket: Socket) {
  console.log("Registering images socket handlers");

  socket.on(
    AppSocketEvents.IMAGES_GET_BASE64,
    async (
      requestData: {
        data: {
          imageFilePath: string;
        };
      },
      callback: (response: {
        success: boolean;
        data?: string;
        error?: string;
      }) => void,
    ) => {
      try {
        console.log("Received request for image base64 conversion:", requestData.data.imageFilePath);
        const base64Image = await imagePathToDisplayable(
          requestData.data.imageFilePath,
        );
        callback({ success: true, data: base64Image });
      } catch (error) {
        log.error("Error fetching playlists:", error);
        callback({ success: false, error: "Failed to fetch playlists" });
      }
    },
  );
}
