import { OllamaModel } from "./../../../models/ollamaModel.model";
import { Socket } from "socket.io";
import { loggingService as log } from "../main-logging.service";
import {
  generateLlmResponse,
  generateLlmResponseByChunks,
  getAvailableModels,
} from "../llm.service";
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

  socket.on(
    LlmSocketEvents.LLM_GENERATE_RESPONSE_BY_CHUNKS,
    async (
      requestData: {
        data: {
          prompt: string;
          model?: string;
          // socketId: string;
          event: string;
        };
      },
      callback: (response: {
        success: boolean;
        data?: string;
        error?: string;
      }) => void,
    ) => {
      try {
        await generateLlmResponseByChunks(
          socket.id,
          requestData.data.event,
          requestData.data.prompt,
          "mobile",
          requestData.data?.model,
        );
        callback({ success: true });
      } catch (error) {
        log.error("Error getting LLM response by chunks:", error);
        callback({ success: false, error: error.message });
      }
    },
  );

  socket.on(
    LlmSocketEvents.GET_ALL_OLLAMA_MODELS,
    async (
      _requestData: unknown,
      callback: (response: {
        success: boolean;
        data?: OllamaModel[];
        error?: string;
      }) => void,
    ) => {
      try {
        const models = await getAvailableModels();
        callback({ success: true, data: models });
      } catch (error) {
        log.error("Error getting Ollama models:", error);
        callback({ success: false, error: error.message });
      }
    },
  );
}
