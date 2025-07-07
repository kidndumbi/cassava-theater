import { ipcMain } from "electron";
import { LlmIPCChannels } from "../../enums/llm-IPC-Channels.enum";
import { 
  generateLlmResponse, 
  generateLlmResponseByChunks, 
  cancelLlmStreamById,
  cancelAllLlmStreams,
  getAvailableModels,
  getActiveLlmStreams,
  pingOllamaServer
} from "../services/llm.service";

export const llmIpcHandlers = () => {
  ipcMain.handle(
    LlmIPCChannels.GENERATE_LLM_RESPONSE,
    async (_event, prompt: string, model?: string) => {
      return generateLlmResponse(prompt, model);
    },
  );

  ipcMain.handle(
    LlmIPCChannels.GENERATE_LLM_RESPONSE_BY_CHUNKS,
    async (
      _event,
      socketId: string,
      event: string,
      prompt: string,
      responseReceiver: "desktop" | "mobile" = "mobile",
      model?: string,
    ) => {
      return generateLlmResponseByChunks(socketId, event, prompt, responseReceiver, model);
    },
  );

  ipcMain.handle(
    LlmIPCChannels.CANCEL_LLM_STREAM_BY_ID,
    async (_event, streamId: string) => {
      return cancelLlmStreamById(streamId);
    },
  );

  ipcMain.handle(
    LlmIPCChannels.CANCEL_ALL_LLM_STREAMS,
    async () => {
      return cancelAllLlmStreams();
    },
  );

  ipcMain.handle(
    LlmIPCChannels.GET_ACTIVE_LLM_STREAMS,
    async () => {
      return getActiveLlmStreams();
    },
  );

  ipcMain.handle(
    LlmIPCChannels.GET_AVAILABLE_MODELS,
    async () => {
      return getAvailableModels();
    },
  );

  ipcMain.handle(
    LlmIPCChannels.PING_OLLAMA_SERVER,
    async (_event, model?: string) => {
      return pingOllamaServer(model);
    },
  );
};
