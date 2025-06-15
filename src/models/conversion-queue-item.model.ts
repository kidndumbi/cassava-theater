export interface ConversionQueueItem {
  id?: string;
  inputPath?: string;
  status?: "pending" | "processing" | "completed" | "failed" | "paused";
  paused?: boolean;
  percent?: number;
  outputPath?: string;
}
