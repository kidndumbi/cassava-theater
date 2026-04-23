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
  const wordCount = text.split(/\s+/).length;
  const avgWordLength = text.replace(/\s+/g, '').length / wordCount;
  
  // Simple heuristic - can be made more sophisticated
  if (wordCount <= 5 && avgWordLength <= 5) return 'easy';
  if (wordCount <= 10 && avgWordLength <= 7) return 'medium';
  return 'hard';
};