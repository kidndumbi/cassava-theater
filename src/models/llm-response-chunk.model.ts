export interface LlmResponseChunk {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}
