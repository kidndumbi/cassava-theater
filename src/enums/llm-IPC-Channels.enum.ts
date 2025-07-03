export enum LlmIPCChannels {
  GENERATE_LLM_RESPONSE = "llm:generateResponse",
  GENERATE_LLM_RESPONSE_BY_CHUNKS = "llm:generateResponseByChunks",
  CANCEL_CURRENT_LLM_BY_CHUNKS_REQUEST = "llm:cancelCurrentByChunksRequest",
  GET_AVAILABLE_MODELS = "llm:getAvailableModels",
}
