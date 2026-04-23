import { levelDBService } from "./levelDB.service";
import { LanguageLearningExerciseModel } from "../../models/language-learning-exercise.model";
import { loggingService as log } from "./main-logging.service";

const COLLECTION_NAME = "languageLearningExercises";

export type LanguageLearningExerciseKeyType = string;

/**
 * Generate a unique key for a language learning exercise
 * Format: videoFilePath:startTime:endTime
 */
export const generateExerciseKey = (
  videoFilePath: string,
  startTime: number,
  endTime: number
): string => {
  const cleanPath = videoFilePath.replace(/[^a-zA-Z0-9]/g, '_');
  return `${cleanPath}:${startTime.toFixed(1)}:${endTime.toFixed(1)}`;
};

/**
 * Save or update a language learning exercise
 */
export const putLanguageLearningExercise = async (
  key: LanguageLearningExerciseKeyType,
  value: Partial<LanguageLearningExerciseModel>
): Promise<LanguageLearningExerciseModel> => {
  try {
    const existing = await getLanguageLearningExercise(key);
    const updated: LanguageLearningExerciseModel = { 
      ...existing, 
      ...value,
      id: key,
      createdAt: existing?.createdAt || Date.now()
    } as LanguageLearningExerciseModel;
    
    await levelDBService.put(COLLECTION_NAME, key, updated);
    log.info(`Saved language learning exercise: ${key}`);
    return updated as LanguageLearningExerciseModel;
  } catch (error) {
    log.error(`Error saving language learning exercise ${key}:`, error);
    throw error;
  }
};

/**
 * Get a specific language learning exercise
 */
export const getLanguageLearningExercise = async (
  key: LanguageLearningExerciseKeyType
): Promise<LanguageLearningExerciseModel | null> => {
  try {
    return await levelDBService.get(COLLECTION_NAME, key) as LanguageLearningExerciseModel;
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'LEVEL_NOT_FOUND') {
      return null;
    }
    log.error(`Error getting language learning exercise ${key}:`, error);
    throw error;
  }
};

/**
 * Get all language learning exercises for a specific video
 */
export const getLanguageLearningExercisesByVideo = async (
  videoFilePath: string
): Promise<LanguageLearningExerciseModel[]> => {
  try {
    const allExercises = await getAllLanguageLearningExercises();
    return allExercises.filter(exercise => exercise.videoFilePath === videoFilePath);
  } catch (error) {
    log.error(`Error getting exercises for video ${videoFilePath}:`, error);
    return [];
  }
};

/**
 * Get all language learning exercises
 */
export const getAllLanguageLearningExercises = async (): Promise<LanguageLearningExerciseModel[]> => {
  try {
    const exercises = await levelDBService.getAll(COLLECTION_NAME);
    return exercises as LanguageLearningExerciseModel[];
  } catch (error) {
    log.error("Error getting all language learning exercises:", error);
    return [];
  }
};

/**
 * Delete a language learning exercise
 */
export const deleteLanguageLearningExercise = async (
  key: LanguageLearningExerciseKeyType
): Promise<void> => {
  try {
    await levelDBService.delete(COLLECTION_NAME, key);
    log.info(`Deleted language learning exercise: ${key}`);
  } catch (error) {
    log.error(`Error deleting language learning exercise ${key}:`, error);
    throw error;
  }
};

/**
 * Update practice statistics for an exercise
 */
export const updateExerciseStats = async (
  key: LanguageLearningExerciseKeyType,
  isCorrect: boolean
): Promise<void> => {
  try {
    const existing = await getLanguageLearningExercise(key);
    if (!existing) {
      log.warn(`Exercise ${key} not found for stats update`);
      return;
    }

    const practiceCount = (existing.practiceCount || 0) + 1;
    const correctCount = (existing.correctCount || 0) + (isCorrect ? 1 : 0);
    const accuracyRate = (correctCount / practiceCount) * 100;

    await putLanguageLearningExercise(key, {
      lastPracticed: Date.now(),
      practiceCount,
      correctCount,
      accuracyRate
    });
  } catch (error) {
    log.error(`Error updating exercise stats ${key}:`, error);
  }
};

/**
 * Calculate difficulty based on text complexity
 */
export const calculateDifficulty = (text: string): 'easy' | 'medium' | 'hard' => {
  // Clean the text and split into words
  const cleanText = text.replace(/[^\w\s]/g, '').trim(); // Remove punctuation
  const words = cleanText.split(/\s+/).filter(word => word.length > 0);
  
  if (words.length === 0) return 'easy';
  
  const wordCount = words.length;
  const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / wordCount;
  
  // Single word logic
  if (wordCount === 1) {
    if (avgWordLength <= 6) return 'easy';    // Short single words
    if (avgWordLength <= 10) return 'medium'; // Medium single words  
    return 'hard';                            // Long single words
  }
  
  // Multi-word logic - consider both word count and average length
  let difficultyScore = 0;
  
  // Word count factor (0-3 points)
  if (wordCount <= 3) difficultyScore += 0;
  else if (wordCount <= 8) difficultyScore += 1;
  else if (wordCount <= 15) difficultyScore += 2;
  else difficultyScore += 3;
  
  // Average word length factor (0-3 points)
  if (avgWordLength <= 4) difficultyScore += 0;
  else if (avgWordLength <= 6) difficultyScore += 1;
  else if (avgWordLength <= 8) difficultyScore += 2;
  else difficultyScore += 3;
  
  // Long word penalty - check if any word is particularly complex
  const hasLongWords = words.some(word => word.length > 12);
  if (hasLongWords) difficultyScore += 1;
  
  // Determine final difficulty
  if (difficultyScore <= 1) return 'easy';
  if (difficultyScore <= 3) return 'medium';
  return 'hard';
};