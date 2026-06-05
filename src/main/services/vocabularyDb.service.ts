import { levelDBService } from "./levelDB.service";
import { VocabularyWordModel } from "../../models/vocabulary-word.model";
import { loggingService as log } from "./main-logging.service";
import { v4 as uuidv4 } from "uuid";

const COLLECTION_NAME = "vocabularyWords";

export const getAllVocabularyWords = async (): Promise<VocabularyWordModel[]> => {
  try {
    const words = await levelDBService.getAll(COLLECTION_NAME);
    return words as VocabularyWordModel[];
  } catch (error) {
    log.error("Error getting all vocabulary words:", error);
    return [];
  }
};

export const getVocabularyWord = async (
  key: string,
): Promise<VocabularyWordModel | null> => {
  try {
    return (await levelDBService.get(COLLECTION_NAME, key)) as VocabularyWordModel;
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: string }).code === "LEVEL_NOT_FOUND"
    ) {
      return null;
    }
    log.error(`Error getting vocabulary word ${key}:`, error);
    throw error;
  }
};

export const putVocabularyWord = async (
  key: string,
  value: Partial<VocabularyWordModel>,
): Promise<VocabularyWordModel> => {
  try {
    const existing = await getVocabularyWord(key);
    const updated: VocabularyWordModel = {
      ...existing,
      ...value,
      id: key,
      createdAt: existing?.createdAt || Date.now(),
    } as VocabularyWordModel;
    await levelDBService.put(COLLECTION_NAME, key, updated);
    log.info(`Saved vocabulary word: ${key}`);
    return updated;
  } catch (error) {
    log.error(`Error saving vocabulary word ${key}:`, error);
    throw error;
  }
};

export const createVocabularyWord = async (
  data: Partial<VocabularyWordModel>,
): Promise<VocabularyWordModel> => {
  if (!data.word || !data.translation) {
    throw new Error("Missing required fields: word, translation");
  }

  const existing = await getAllVocabularyWords();
  const isDuplicate = existing.some(
    (w) =>
      w.word.toLowerCase() === (data.word ?? "").toLowerCase() &&
      w.practiceLanguage === data.practiceLanguage,
  );
  if (isDuplicate) {
    throw new Error(
      `A vocabulary word "${data.word}" already exists for this language.`,
    );
  }

  const key = uuidv4();
  return putVocabularyWord(key, { ...data, createdAt: Date.now() });
};

export const deleteVocabularyWord = async (key: string): Promise<void> => {
  try {
    await levelDBService.delete(COLLECTION_NAME, key);
    log.info(`Deleted vocabulary word: ${key}`);
  } catch (error) {
    log.error(`Error deleting vocabulary word ${key}:`, error);
    throw error;
  }
};

export const updateVocabularyWordStats = async (
  key: string,
  isCorrect: boolean,
  exerciseType: "multiple-choice" | "spell-word" = "multiple-choice",
): Promise<void> => {
  try {
    const existing = await getVocabularyWord(key);
    if (!existing) {
      log.warn(`Vocabulary word ${key} not found for stats update`);
      return;
    }
    const practiceCount = (existing.practiceCount || 0) + 1;
    const correctCount = (existing.correctCount || 0) + (isCorrect ? 1 : 0);
    const accuracyRate = (correctCount / practiceCount) * 100;

    const patch: Partial<VocabularyWordModel> = {
      lastPracticed: Date.now(),
      practiceCount,
      correctCount,
      accuracyRate,
    };

    if (exerciseType === "multiple-choice") {
      patch.mcTotal = (existing.mcTotal ?? 0) + 1;
      patch.mcCorrect = (existing.mcCorrect ?? 0) + (isCorrect ? 1 : 0);
    } else {
      patch.swTotal = (existing.swTotal ?? 0) + 1;
      patch.swCorrect = (existing.swCorrect ?? 0) + (isCorrect ? 1 : 0);
    }

    await putVocabularyWord(key, patch);
  } catch (error) {
    log.error(`Error updating vocabulary word stats ${key}:`, error);
  }
};
