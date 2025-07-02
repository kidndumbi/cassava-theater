import { ipcMain } from "electron";
import { LlmIPCChannels } from "../../enums/llm-IPC-Channels.enum";
import { generateLlmResponse, generateLlmResponseByChunks, cancelCurrentLlmByChunksRequest } from "../services/llm.service";

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
    LlmIPCChannels.CANCEL_CURRENT_LLM_BY_CHUNKS_REQUEST,
    async () => {
      return cancelCurrentLlmByChunksRequest();
    },
  );
};
