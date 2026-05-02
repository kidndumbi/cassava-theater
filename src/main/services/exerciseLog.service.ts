import { v4 as uuidv4 } from "uuid";
import { levelDBService } from "./levelDB.service";
import {
  ExerciseLogEntry,
  ExerciseLogs,
} from "../../models/exercise-log.model";
import { loggingService as log } from "./main-logging.service";

const COLLECTION = "exerciseLogs" as const;

const getOrCreate = async (exerciseId: string): Promise<ExerciseLogs> => {
  try {
    const existing = await levelDBService.get(COLLECTION, exerciseId);
    return existing ?? { exerciseId, entries: [] };
  } catch {
    return { exerciseId, entries: [] };
  }
};

export const logPracticeResult = async (
  exerciseId: string,
  isCorrect: boolean,
  userAnswer: string,
  correctAnswer: string,
  nativeText: string,
): Promise<void> => {
  try {
    const logs = await getOrCreate(exerciseId);
    const entry: ExerciseLogEntry = {
      id: uuidv4(),
      exerciseId,
      timestamp: Date.now(),
      type: "practice",
      practiceDetails: { isCorrect, userAnswer, correctAnswer, nativeText },
    };
    logs.entries.push(entry);
    await levelDBService.put(COLLECTION, exerciseId, logs);
  } catch (error) {
    log.error(
      `Error logging practice result for exercise ${exerciseId}:`,
      error,
    );
  }
};

export const logExerciseUpdate = async (
  exerciseId: string,
  before: Record<string, any>,
  after: Record<string, any>,
): Promise<void> => {
  try {
    const TRACKED_FIELDS = [
      "practiceLanguageText",
      "nativeLanguageText",
      "practiceLanguage",
      "nativeLanguage",
      "difficulty",
      "tags",
    ];
    const changedFields = TRACKED_FIELDS.filter(
      (key) => JSON.stringify(before[key]) !== JSON.stringify(after[key]),
    );
    if (changedFields.length === 0) return;

    const logs = await getOrCreate(exerciseId);
    const entry: ExerciseLogEntry = {
      id: uuidv4(),
      exerciseId,
      timestamp: Date.now(),
      type: "exercise-update",
      updateDetails: {
        changedFields,
        before: Object.fromEntries(changedFields.map((k) => [k, before[k]])),
        after: Object.fromEntries(changedFields.map((k) => [k, after[k]])),
      },
    };
    logs.entries.push(entry);
    await levelDBService.put(COLLECTION, exerciseId, logs);
  } catch (error) {
    log.error(`Error logging exercise update for ${exerciseId}:`, error);
  }
};

export const getExerciseLogs = async (
  exerciseId: string,
): Promise<ExerciseLogs> => {
  return getOrCreate(exerciseId);
};

export const deleteExerciseLogs = async (
  exerciseId: string,
): Promise<void> => {
  try {
    await levelDBService.delete(COLLECTION, exerciseId);
  } catch {
    // No logs to delete — that's fine
  }
};
