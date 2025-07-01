import { Socket } from "socket.io";
import { loggingService as log } from "../main-logging.service";
import { generateLlmResponse } from "../llm.service";
import { LlmSocketEvents } from "../../../enums/llm-socket-events.enum";

export function registerLlmSocketHandlers(socket: Socket) {
  socket.on(
    LlmSocketEvents.LLM_GENERATE_RESPONSE,
    async (
      requestData: {
        data: {
          prompt: string;
          model?: string;
        };
      },
      callback: (response: {
        success: boolean;
        data?: string;
        error?: string;
      }) => void,
    ) => {
      try {
        const llmResponse = await generateLlmResponse(
          requestData.data.prompt,
          requestData.data?.model,
        );
        callback({ success: true, data: llmResponse });
      } catch (error) {
        log.error("Error getting LLM response:", error);
        callback({ success: false, error: error.message });
      }
    },
  );
}
