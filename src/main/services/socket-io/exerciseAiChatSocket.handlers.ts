import { Socket } from "socket.io";
import { loggingService as log } from "../main-logging.service";
import {
  getConversation,
  saveConversation,
  deleteConversation,
} from "../exerciseAiChat.service";
import { AppSocketEvents } from "../../../enums/app-socket-events.enum";
import { ExerciseAiMessage } from "../../../models/exercise-ai-chat.model";

export function registerExerciseAiChatHandlers(socket: Socket) {
  socket.on(
    AppSocketEvents.EXERCISE_AI_GET_CONVERSATION,
    async (
      data: { exerciseId: string },
      callback: (response: { success: boolean; data?: any; error?: string }) => void,
    ) => {
      try {
        const conversation = await getConversation(data.exerciseId);
        callback({ success: true, data: conversation });
      } catch (error) {
        log.error("Error getting AI conversation:", error);
        callback({
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    },
  );

  socket.on(
    AppSocketEvents.EXERCISE_AI_SAVE_CONVERSATION,
    async (
      data: { exerciseId: string; messages: ExerciseAiMessage[] },
      callback: (response: { success: boolean; error?: string }) => void,
    ) => {
      try {
        await saveConversation(data.exerciseId, data.messages);
        callback({ success: true });
      } catch (error) {
        log.error("Error saving AI conversation:", error);
        callback({
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    },
  );

  socket.on(
    AppSocketEvents.EXERCISE_AI_DELETE_CONVERSATION,
    async (
      data: { exerciseId: string },
      callback: (response: { success: boolean; error?: string }) => void,
    ) => {
      try {
        await deleteConversation(data.exerciseId);
        callback({ success: true });
      } catch (error) {
        log.error("Error deleting AI conversation:", error);
        callback({
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    },
  );
}
