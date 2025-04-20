export interface ConversionQueueItem {
  inputPath?: string;
  status?: "pending" | "processing" | "completed" | "failed" | "paused";
  paused?: boolean;
}
