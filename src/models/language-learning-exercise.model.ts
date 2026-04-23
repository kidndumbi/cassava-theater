export interface LanguageLearningExerciseModel {
  id?: string; // Unique identifier for the exercise
  videoFilePath: string; // Path to the video file
  videoFileName?: string; // Name of the video file
  nativeLanguageText: string; // Text in native language (reference)
  practiceLanguageText: string; // Text in practice language (exercise)
  nativeLanguage: 'en' | 'es' | 'fr'; // Native language code
  practiceLanguage: 'en' | 'es' | 'fr'; // Practice language code
  startTime: number; // Start time in seconds
  endTime: number; // End time in seconds
  duration: number; // Duration of the subtitle segment
  wordCount: number; // Number of words in the exercise
  difficulty?: 'easy' | 'medium' | 'hard'; // Calculated difficulty
  createdAt: number; // Timestamp when exercise was captured
  lastPracticed?: number; // Last time this exercise was practiced
  practiceCount?: number; // How many times practiced
  correctCount?: number; // How many times answered correctly
  accuracyRate?: number; // Percentage of correct answers
  tags?: string[]; // Optional tags for categorization
}