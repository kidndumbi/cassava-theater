import { v4 as uuidv4 } from "uuid";
import { levelDBService } from "./levelDB.service";
import { VocabularyLogEntry, VocabularyLogs } from "../../models/vocabulary-log.model";
import { loggingService as log } from "./main-logging.service";

const COLLECTION = "vocabularyLogs" as const;

const getOrCreate = async (wordId: string): Promise<VocabularyLogs> => {
  try {
    const existing = await levelDBService.get(COLLECTION, wordId);
    return existing ?? { wordId, entries: [] };
  } catch {
    return { wordId, entries: [] };
  }
};

export const logVocabularyPractice = async (
  wordId: string,
  isCorrect: boolean,
): Promise<void> => {
  try {
    const logs = await getOrCreate(wordId);
    const entry: VocabularyLogEntry = {
      id: uuidv4(),
      wordId,
      timestamp: Date.now(),
      type: "practice",
      practiceDetails: { isCorrect },
    };
    logs.entries.push(entry);
    await levelDBService.put(COLLECTION, wordId, logs);
  } catch (error) {
    log.error(`Error logging vocabulary practice for word ${wordId}:`, error);
  }
};

export const logVocabularyUpdate = async (
  wordId: string,
  before: Record<string, any>,
  after: Record<string, any>,
): Promise<void> => {
  try {
    const TRACKED_FIELDS = ["word", "translation", "difficulty", "notes", "tags"];
    const changedFields = TRACKED_FIELDS.filter(
      (key) => JSON.stringify(before[key]) !== JSON.stringify(after[key]),
    );
    if (changedFields.length === 0) return;

    const logs = await getOrCreate(wordId);
    const entry: VocabularyLogEntry = {
      id: uuidv4(),
      wordId,
      timestamp: Date.now(),
      type: "word-update",
      updateDetails: {
        changedFields,
        before: Object.fromEntries(changedFields.map((k) => [k, before[k]])),
        after: Object.fromEntries(changedFields.map((k) => [k, after[k]])),
      },
    };
    logs.entries.push(entry);
    await levelDBService.put(COLLECTION, wordId, logs);
  } catch (error) {
    log.error(`Error logging vocabulary update for word ${wordId}:`, error);
  }
};

export const getVocabularyLogs = async (wordId: string): Promise<VocabularyLogs> => {
  return getOrCreate(wordId);
};

export const deleteVocabularyLogs = async (wordId: string): Promise<void> => {
  try {
    await levelDBService.delete(COLLECTION, wordId);
  } catch {
    // No logs to delete — that's fine
  }
};
