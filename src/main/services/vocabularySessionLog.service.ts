import { levelDBService } from "./levelDB.service";
import { VocabularySessionLog } from "../../models/vocabulary-session-log.model";
import { loggingService as log } from "./main-logging.service";

const COLLECTION_NAME = "vocabularySessionLogs";

const getTodayKey = (): string => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export const logVocabularyPracticeSession = async (
  wordId: string,
  isCorrect: boolean,
): Promise<void> => {
  try {
    const key = getTodayKey();
    let existing: VocabularySessionLog | null = null;

    try {
      existing = (await levelDBService.get(
        COLLECTION_NAME,
        key,
      )) as VocabularySessionLog;
    } catch {
      // No entry for today yet — that's fine
    }

    const current: VocabularySessionLog = existing ?? {
      date: key,
      totalAttempts: 0,
      correctCount: 0,
      wordsAttempted: [],
    };

    const wordsAttempted = current.wordsAttempted.includes(wordId)
      ? current.wordsAttempted
      : [...current.wordsAttempted, wordId];

    const updated: VocabularySessionLog = {
      ...current,
      date: key,
      totalAttempts: current.totalAttempts + 1,
      correctCount: current.correctCount + (isCorrect ? 1 : 0),
      wordsAttempted,
    };

    await levelDBService.put(COLLECTION_NAME, key, updated);
  } catch (error) {
    log.error("Error logging vocabulary practice session:", error);
  }
};

export const getAllVocabularySessionLogs = async (): Promise<VocabularySessionLog[]> => {
  try {
    const logs = await levelDBService.getAll(COLLECTION_NAME);
    return (logs as VocabularySessionLog[]).sort((a, b) =>
      a.date.localeCompare(b.date),
    );
  } catch (error) {
    log.error("Error getting vocabulary session logs:", error);
    return [];
  }
};
