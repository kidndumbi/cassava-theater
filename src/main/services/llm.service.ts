import { OllamaModel } from "./../../models/ollamaModel.model";
import { LlmResponseChunk } from "./../../models/llm-response-chunk.model";
import { getSocketIoGlobal } from "../socketGlobalManager";
import axios, { isAxiosError } from "axios";
import { getMainWindow } from "../mainWindowManager";
import { v4 as uuidv4 } from "uuid";

const OLLAMA_API_URL = "http://localhost:11434/api/generate";

interface OllamaRequest {
  model: string;
  prompt: string;
}

interface OllamaModelsResponse {
  models: OllamaModel[];
}

export const getAvailableModels = async (): Promise<OllamaModel[]> => {
  try {
    const response = await axios.get<OllamaModelsResponse>(
      "http://localhost:11434/api/tags",
    );
    return response.data.models;
  } catch (error) {
    throw processError(error);
  }
};

// Replace the single abort controller with a Map for multiple streams
const activeStreams = new Map<string, AbortController>();

const makeOllamaRequest = async (request: OllamaRequest, options = {}) => {
  return axios.post(OLLAMA_API_URL, request, {
    responseType: "stream",
    ...options,
  });
};

const processError = (error: unknown): Error => {
  console.error("Error generating LLM response:", error);

  if (isAxiosError(error)) {
    if (error.response?.status === 404) {
      return new Error(
        "LLM service not found. Please check if Ollama is running on http://localhost:11434 and the API endpoint is correct.",
      );
    } else if (error.response?.status) {
      return new Error(
        `LLM service error: ${error.response.status} - ${error.response.statusText}`,
      );
    } else if (error.code === "ECONNREFUSED") {
      return new Error(
        "Cannot connect to LLM service. Please ensure Ollama is running on http://localhost:11434",
      );
    }
  }

  return new Error(
    `Failed to generate LLM response: ${(error as Error).message || error}`,
  );
};

const processChunkLines = (
  chunk: Buffer,
  callback: (line: LlmResponseChunk) => void,
) => {
  const chunkStr = chunk.toString();
  const lines = chunkStr.split("\n").filter((line) => line.trim());

  for (const line of lines) {
    try {
      const parsed = JSON.parse(line);
      callback(parsed);
    } catch (e) {
      console.error("Error parsing chunk:", line);
    }
  }
};

const handleResponse = (
  responseReceiver: "desktop" | "mobile",
  socketId: string,
  event: string,
  data: any,
) => {
  const socketIo = getSocketIoGlobal();
  const mainWindow = getMainWindow();

  if (responseReceiver === "mobile") {
    socketIo.to(socketId).emit(event, data);
  } else if (responseReceiver === "desktop") {
    mainWindow.webContents.send("video-ai-chat-data-chunks", data);
  }
};

const handleError = (
  responseReceiver: "desktop" | "mobile",
  socketId: string,
  event: string,
  errorMessage: string,
) => {
  const socketIo = getSocketIoGlobal();
  const mainWindow = getMainWindow();

  if (responseReceiver === "mobile") {
    socketIo.to(socketId).emit(event + "_error", errorMessage);
  } else if (responseReceiver === "desktop") {
    mainWindow.webContents.send("video-ai-chat-response-error", errorMessage);
  }
};

export const generateLlmResponse = async (
  prompt: string,
  model = "llama3.1:latest",
): Promise<string> => {
  try {
    const response = await makeOllamaRequest({ model, prompt });

    return new Promise((resolve, reject) => {
      let fullResponse = "";

      const handleData = (chunk: Buffer) => {
        processChunkLines(chunk, (parsed) => {
          if (parsed.response) {
            fullResponse += parsed.response;
          }
          if (parsed.done) {
            resolve(fullResponse);
          }
        });
      };

      response.data.on("data", handleData);
      response.data.on("error", reject);
      response.data.on("end", () => resolve(fullResponse));
    });
  } catch (error) {
    throw processError(error);
  }
};

export const generateLlmResponseByChunks = async (
  socketId: string,
  event: string,
  prompt: string,
  responseReceiver: "desktop" | "mobile" = "mobile",
  model = "llama3.1:latest",
): Promise<string> => {
  const streamId = uuidv4();
  const abortController = new AbortController();
  activeStreams.set(streamId, abortController);

  try {
    const response = await makeOllamaRequest(
      { model, prompt },
      { signal: abortController.signal },
    );

    response.data.on("data", (chunk: Buffer) => {
      if (abortController.signal.aborted) return;
      processChunkLines(chunk, (parsed) => {
        handleResponse(responseReceiver, socketId, event, parsed);
        if (parsed.done) {
          activeStreams.delete(streamId);
        }
      });
    });

    response.data.on("error", (error: Error) => {
      activeStreams.delete(streamId);
      if (!abortController.signal.aborted) {
        handleError(responseReceiver, socketId, event, error.message);
      }
    });

    response.data.on("end", () => {
      activeStreams.delete(streamId);
    });

    return streamId;
  } catch (error) {
    activeStreams.delete(streamId);
    if (!abortController.signal.aborted) {
      handleError(
        responseReceiver,
        socketId,
        event,
        processError(error).message,
      );
    }
    throw error;
  }
};

export const cancelLlmStreamById = (streamId: string): boolean => {
  const abortController = activeStreams.get(streamId);
  if (abortController) {
    abortController.abort();
    activeStreams.delete(streamId);
    return true;
  }
  return false;
};

export const cancelAllLlmStreams = (): number => {
  const canceledCount = activeStreams.size;
  activeStreams.forEach((controller) => controller.abort());
  activeStreams.clear();
  return canceledCount;
};

export const getActiveLlmStreams = (): string[] => {
  return Array.from(activeStreams.keys());
};
