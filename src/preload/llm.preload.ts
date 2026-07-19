import { contextBridge, ipcRenderer } from "electron";
import { LlmIPCChannels } from "../enums/llm-IPC-Channels.enum";

export function exposeLlmApi() {
  contextBridge.exposeInMainWorld("llmAPI", {
    generateLlmResponse: (prompt: string, model?: string) => ipcRenderer.invoke(LlmIPCChannels.GENERATE_LLM_RESPONSE, prompt, model),
    generateLlmResponseByChunks: (socketId: string, event: string, prompt: string, responseReceiver: "desktop" | "mobile" = "mobile", model?: string) =>
      ipcRenderer.invoke(LlmIPCChannels.GENERATE_LLM_RESPONSE_BY_CHUNKS, socketId, event, prompt, responseReceiver, model),
    cancelLlmStreamById: (streamId: string) => ipcRenderer.invoke(LlmIPCChannels.CANCEL_LLM_STREAM_BY_ID, streamId),
    cancelAllLlmStreams: () => ipcRenderer.invoke(LlmIPCChannels.CANCEL_ALL_LLM_STREAMS),
    getActiveLlmStreams: () => ipcRenderer.invoke(LlmIPCChannels.GET_ACTIVE_LLM_STREAMS),
    getAvailableModels: () => ipcRenderer.invoke(LlmIPCChannels.GET_AVAILABLE_MODELS),
    pingOllamaServer: (model?: string) => ipcRenderer.invoke(LlmIPCChannels.PING_OLLAMA_SERVER, model),
  });
}