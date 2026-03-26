export interface SubtitleSyncQueueItem {
  id?: string;
  videoPath?: string;
  subtitlePath?: string;
  fileName?: string;
  status?: "pending" | "processing" | "completed" | "failed" | "paused";
  paused?: boolean;
  percent?: number;
  error?: string;
  queueIndex?: number;
  syncedSubtitlePath?: string; // Path to the synced subtitle file
  splitPenalty?: number; // alass split penalty parameter
  noSplits?: boolean; // alass no-splits parameter
}