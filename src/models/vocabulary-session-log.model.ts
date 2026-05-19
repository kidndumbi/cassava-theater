export interface VocabularySessionLog {
  date: string; // 'YYYY-MM-DD'
  totalAttempts: number;
  correctCount: number;
  wordsAttempted: string[]; // unique word IDs practiced this day
}
