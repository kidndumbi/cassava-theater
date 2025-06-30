import { ipcMain } from "electron";
import { LlmIPCChannels } from "../../enums/llm-IPC-Channels.enum";
import { generateLlmResponse } from "../services/llm.service";

export const llmIpcHandlers = () => {
  ipcMain.handle(
    LlmIPCChannels.GENERATE_LLM_RESPONSE,
    async (_event, prompt: string, model?: string) => {
      return generateLlmResponse(prompt, model);
    },
  );
};
