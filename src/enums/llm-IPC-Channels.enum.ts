export enum LlmIPCChannels {
  GENERATE_LLM_RESPONSE = "llm:generateResponse",
  GENERATE_LLM_RESPONSE_BY_CHUNKS = "llm:generateResponseByChunks",
  CANCEL_LLM_STREAM_BY_ID = "llm:cancelLlmStreamById",
  CANCEL_ALL_LLM_STREAMS = "llm:cancelAllLlmStreams",
  GET_AVAILABLE_MODELS = "llm:getAvailableModels",
  GET_ACTIVE_LLM_STREAMS = "llm:getActiveLlmStreams",
  PING_OLLAMA_SERVER = "llm:pingOllamaServer",
}

// Language Learning Exercise IPC Channels
export enum LanguageLearningIPCChannels {
  SAVE_EXERCISE = "language-learning:saveExercise",
  GET_EXERCISE = "language-learning:getExercise",
  GET_EXERCISES_BY_VIDEO = "language-learning:getExercisesByVideo",
  GET_ALL_EXERCISES = "language-learning:getAllExercises",
  DELETE_EXERCISE = "language-learning:deleteExercise",
  UPDATE_EXERCISE = "language-learning:updateExercise",
  UPDATE_EXERCISE_STATS = "language-learning:updateExerciseStats",
}
