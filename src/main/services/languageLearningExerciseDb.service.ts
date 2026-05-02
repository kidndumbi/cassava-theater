import { levelDBService } from "./levelDB.service";
import { LanguageLearningExerciseModel } from "../../models/language-learning-exercise.model";
import { loggingService as log } from "./main-logging.service";
import { v4 as uuidv4 } from "uuid";
import { logPracticeAttempt } from "./sessionLog.service";
import { logPracticeResult } from "./exerciseLog.service";

const COLLECTION_NAME = "languageLearningExercises";

export type LanguageLearningExerciseKeyType = string;

/**
 * Generate a unique key for a language learning exercise
 * Format: videoFilePath:startTime:endTime
 */
export const generateExerciseKey = (
  startTime: number,
  endTime: number,
): string => {
  return `${uuidv4()}:${startTime.toFixed(1)}:${endTime.toFixed(1)}`;
};

/**
 * Save or update a language learning exercise
 */
export const putLanguageLearningExercise = async (
  key: LanguageLearningExerciseKeyType,
  value: Partial<LanguageLearningExerciseModel>,
): Promise<LanguageLearningExerciseModel> => {
  try {
    const existing = await getLanguageLearningExercise(key);
    const updated: LanguageLearningExerciseModel = {
      ...existing,
      ...value,
      id: key,
      // remove <i> and </i> tags, and [ ... ] blocks from practiceLanguageText for better searchability
      // practiceLanguageText: value.practiceLanguageText
      //   ? cleanLanguageText(value.practiceLanguageText)
      //   : existing?.practiceLanguageText || "",
      // // remove <i> and </i> tags, and [ ... ] blocks from nativeLanguageText for better searchability
      // nativeLanguageText: value.nativeLanguageText
      //   ? cleanLanguageText(value.nativeLanguageText)
      //   : existing?.nativeLanguageText || "",

      createdAt: existing?.createdAt || Date.now(),
    } as LanguageLearningExerciseModel;

    await levelDBService.put(COLLECTION_NAME, key, updated);
    log.info(`Saved language learning exercise: ${key}`);
    return updated as LanguageLearningExerciseModel;
  } catch (error) {
    log.error(`Error saving language learning exercise ${key}:`, error);
    throw error;
  }
};

// const cleanLanguageText = (text: string): string => {
//   return text
//     .replace(/<\/?i>/g, "")           // Remove <i> and </i> tags
//     // eslint-disable-next-line no-useless-escape
//     .replace(/[<>#\[\]]/g, "")        // Remove <, >, #, [, and ] characters
//     .replace(/\s+/g, " ")             // Collapse multiple spaces into one
//     .trim();
// };

/**
 * Get a specific language learning exercise
 */
export const getLanguageLearningExercise = async (
  key: LanguageLearningExerciseKeyType,
): Promise<LanguageLearningExerciseModel | null> => {
  try {
    return (await levelDBService.get(
      COLLECTION_NAME,
      key,
    )) as LanguageLearningExerciseModel;
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "LEVEL_NOT_FOUND"
    ) {
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
  videoFilePath: string,
): Promise<LanguageLearningExerciseModel[]> => {
  try {
    const allExercises = await getAllLanguageLearningExercises();
    return allExercises.filter(
      (exercise) => exercise.videoFilePath === videoFilePath,
    );
  } catch (error) {
    log.error(`Error getting exercises for video ${videoFilePath}:`, error);
    return [];
  }
};

/**
 * Get all language learning exercises
 */
export const getAllLanguageLearningExercises = async (): Promise<
  LanguageLearningExerciseModel[]
> => {
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
  key: LanguageLearningExerciseKeyType,
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
  isCorrect: boolean,
  snapshot?: { userAnswer: string; correctAnswer: string; nativeText: string },
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
      accuracyRate,
    });

    await logPracticeAttempt(key, isCorrect);

    if (snapshot) {
      await logPracticeResult(
        key,
        isCorrect,
        snapshot.userAnswer,
        snapshot.correctAnswer,
        snapshot.nativeText,
      );
    }
  } catch (error) {
    log.error(`Error updating exercise stats ${key}:`, error);
  }
};


