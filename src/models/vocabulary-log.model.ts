export type VocabularyLogType = 'practice' | 'word-update';

export interface VocabularyPracticeDetails {
  isCorrect: boolean;
}

export interface VocabularyUpdateDetails {
  changedFields: string[];
  before: Record<string, any>;
  after: Record<string, any>;
}

export interface VocabularyLogEntry {
  id: string;
  wordId: string;
  timestamp: number;
  type: VocabularyLogType;
  practiceDetails?: VocabularyPracticeDetails;
  updateDetails?: VocabularyUpdateDetails;
}

export interface VocabularyLogs {
  wordId: string;
  entries: VocabularyLogEntry[];
}
