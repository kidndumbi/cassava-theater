export interface SubtitleGenerationQueueItem {
  id?: string;
  videoPath?: string;
  fileName?: string;
  subtitlePath?: string;
  status?: "pending" | "processing" | "completed" | "failed" | "paused";
  percent?: number;
  error?: string;
  language?: string;
  format?: "srt" | "vtt" | "ass";
  model?: string;
  queueIndex?: number;
}
