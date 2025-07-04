export enum LlmIPCChannels {
  GENERATE_LLM_RESPONSE = "llm:generateResponse",
  GENERATE_LLM_RESPONSE_BY_CHUNKS = "llm:generateResponseByChunks",
  CANCEL_LLM_STREAM_BY_ID = "llm:cancelLlmStreamById",
  CANCEL_ALL_LLM_STREAMS = "llm:cancelAllLlmStreams",
  GET_AVAILABLE_MODELS = "llm:getAvailableModels",
  GET_ACTIVE_LLM_STREAMS = "llm:getActiveLlmStreams",
}
