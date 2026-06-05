export interface VocabularyWordModel {
  id: string;
  word: string;
  translation: string;
  practiceLanguage: "en" | "es" | "fr";
  nativeLanguage: "en" | "es" | "fr";
  difficulty?: "easy" | "medium" | "hard";
  tags?: string[];
  practiceCount?: number;
  correctCount?: number;
  accuracyRate?: number;
  /** Per-exercise-type stats: multiple-choice */
  mcTotal?: number;
  mcCorrect?: number;
  /** Per-exercise-type stats: spell-word */
  swTotal?: number;
  swCorrect?: number;
  isFavorite?: boolean;
  isMarkedForReview?: boolean;
  notes?: string;
  createdAt: number;
  lastPracticed?: number;
}
