import { OllamaModel } from "./../../../models/ollamaModel.model";
import { Socket } from "socket.io";
import { loggingService as log } from "../main-logging.service";
import {
  generateLlmResponse,
  generateLlmResponseByChunks,
  getAvailableModels,
  cancelLlmStreamById,
  pingOllamaServer,
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
        const streamId = await generateLlmResponseByChunks(
          socket.id,
          requestData.data.event,
          requestData.data.prompt,
          "mobile",
          requestData.data?.model,
        );
        callback({ success: true, data: streamId });
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

  socket.on(
    "cancel-llm-stream",
    async (
      requestData: { data: { streamId: string } },
      callback: (response: {
        success: boolean;
        data?: boolean;
        error?: string;
      }) => void,
    ) => {
      try {
        const canceled = cancelLlmStreamById(requestData.data.streamId);
        callback({ success: true, data: canceled });
      } catch (error) {
        log.error("Error canceling LLM stream:", error);
        callback({ success: false, error: error.message });
      }
    },
  );

  socket.on(
    LlmSocketEvents.PING_OLLAMA_SERVER,
    async (
      requestData: {
        data: {
          model?: string;
        };
      },
      callback: (response: {
        success: boolean;
        data?: boolean;
        error?: string;
      }) => void,
    ) => {
      try {
        const pingResult = await pingOllamaServer(requestData.data?.model);
        callback({ success: true, data: pingResult });
      } catch (error) {
        log.error("Error pinging Ollama server:", error);
        callback({ success: false, error: error.message });
      }
    },
  );
}
