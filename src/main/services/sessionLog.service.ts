import { levelDBService } from "./levelDB.service";
import { PracticeSessionLog } from "../../models/practice-session-log.model";
import { loggingService as log } from "./main-logging.service";

const COLLECTION_NAME = "practiceSessionLogs";

const getTodayKey = (): string => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export const logPracticeAttempt = async (
  exerciseId: string,
  isCorrect: boolean,
): Promise<void> => {
  try {
    const key = getTodayKey();
    let existing: PracticeSessionLog | null = null;

    try {
      existing = (await levelDBService.get(
        COLLECTION_NAME,
        key,
      )) as PracticeSessionLog;
    } catch {
      // No entry for today yet — that's fine
    }

    const current: PracticeSessionLog = existing ?? {
      date: key,
      totalAttempts: 0,
      correctCount: 0,
      exercisesAttempted: [],
    };

    const exercisesAttempted = current.exercisesAttempted.includes(exerciseId)
      ? current.exercisesAttempted
      : [...current.exercisesAttempted, exerciseId];

    const updated: PracticeSessionLog = {
      date: key,
      totalAttempts: current.totalAttempts + 1,
      correctCount: current.correctCount + (isCorrect ? 1 : 0),
      exercisesAttempted,
    };

    await levelDBService.put(COLLECTION_NAME, key, updated);
  } catch (error) {
    log.error("Error logging practice attempt:", error);
  }
};

export const getAllSessionLogs = async (): Promise<PracticeSessionLog[]> => {
  try {
    const logs = await levelDBService.getAll(COLLECTION_NAME);
    return (logs as PracticeSessionLog[]).sort((a, b) =>
      a.date.localeCompare(b.date),
    );
  } catch (error) {
    log.error("Error getting session logs:", error);
    return [];
  }
};

export const getTodaySessionLog = async (): Promise<PracticeSessionLog> => {
  const key = getTodayKey();
  try {
    const log_data = (await levelDBService.get(
      COLLECTION_NAME,
      key,
    )) as PracticeSessionLog;
    return log_data;
  } catch {
    return {
      date: key,
      totalAttempts: 0,
      correctCount: 0,
      exercisesAttempted: [],
    };
  }
};
