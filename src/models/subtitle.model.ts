export interface SubtitleGeneration {
  videoPath: string;
  subtitlePath?: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  progress?: number;
  error?: string;
  language?: string;
  format?: 'srt' | 'vtt' | 'ass';
  createdAt: Date;
  completedAt?: Date;
}

export interface SubtitleGenerationRequest {
  videoPath: string;
  language?: string;
  format?: 'srt' | 'vtt' | 'ass';
  model?: 'tiny' | 'base' | 'small' | 'medium' | 'large';
}

export interface SubtitleGenerationResponse {
  success: boolean;
  subtitlePath?: string;
  error?: string;
  jobId: string;
}