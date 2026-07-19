import { ipcMain } from "electron";
import { Socket } from "socket.io";
import { LlmIPCChannels } from "../../enums/llm-IPC-Channels.enum";
import { 
  generateLlmResponse, generateLlmResponseByChunks, cancelLlmStreamById,
  cancelAllLlmStreams, getAvailableModels, getActiveLlmStreams, pingOllamaServer
} from "../services/llm.service";
import { loggingService as log } from "../services/main-logging.service";

export const registerLlmHandlers = {
  ipc(): void {
    ipcMain.handle(LlmIPCChannels.GENERATE_LLM_RESPONSE, async (_event, prompt: string, model?: string) => generateLlmResponse(prompt, model));
    ipcMain.handle(LlmIPCChannels.GENERATE_LLM_RESPONSE_BY_CHUNKS, async (_event, socketId: string, event: string, prompt: string, responseReceiver: "desktop" | "mobile" = "mobile", model?: string) => generateLlmResponseByChunks(socketId, event, prompt, responseReceiver, model));
    ipcMain.handle(LlmIPCChannels.CANCEL_LLM_STREAM_BY_ID, async (_event, streamId: string) => cancelLlmStreamById(streamId));
    ipcMain.handle(LlmIPCChannels.CANCEL_ALL_LLM_STREAMS, async () => cancelAllLlmStreams());
    ipcMain.handle(LlmIPCChannels.GET_ACTIVE_LLM_STREAMS, async () => getActiveLlmStreams());
    ipcMain.handle(LlmIPCChannels.GET_AVAILABLE_MODELS, async () => getAvailableModels());
    ipcMain.handle(LlmIPCChannels.PING_OLLAMA_SERVER, async (_event, model?: string) => pingOllamaServer(model));
  },

  socket(socket: Socket): void {
    // LLM socket handlers are covered by the existing llmSocket.handlers.ts logic
    // that triggers streaming directly from the mobile client.
    // The actual chat chunk emission is handled in llm.service.ts via mainWindow.webContents.send.
    // No additional socket registration needed here beyond what's already handled.
  },
};