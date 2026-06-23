import { ipcMain } from "electron";
import { VocabularyIPCChannels } from "../../enums/vocabularyIPCChannels.enum";
import {
  getAllVocabularyWords,
  getVocabularyWord,
  createVocabularyWord,
  putVocabularyWord,
  deleteVocabularyWord,
  updateVocabularyWordStats,
} from "../services/vocabularyDb.service";
import { loggingService as log } from "../services/main-logging.service";

export const vocabularyIpcHandlers = () => {
  // Get all vocabulary words
  ipcMain.handle(VocabularyIPCChannels.GET_ALL_WORDS, async () => {
    try {
      const words = await getAllVocabularyWords();
      return { success: true, data: words };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log.error("IPC Error getting all vocabulary words:", error);
      return { success: false, error: errorMessage };
    }
  });

  // Get a specific vocabulary word
  ipcMain.handle(VocabularyIPCChannels.GET_WORD, async (_event, key: string) => {
    try {
      const word = await getVocabularyWord(key);
      return { success: true, data: word };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log.error(`IPC Error getting vocabulary word ${key}:`, error);
      return { success: false, error: errorMessage };
    }
  });

  // Create a new vocabulary word
  ipcMain.handle(
    VocabularyIPCChannels.CREATE_WORD,
    async (_event, data: Partial<import("../../models/vocabulary-word.model").VocabularyWordModel>) => {
      try {
        const word = await createVocabularyWord(data);
        return { success: true, data: word };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        log.error("IPC Error creating vocabulary word:", error);
        return { success: false, error: errorMessage };
      }
    },
  );

  // Update a vocabulary word
  ipcMain.handle(
    VocabularyIPCChannels.UPDATE_WORD,
    async (_event, key: string, data: Partial<import("../../models/vocabulary-word.model").VocabularyWordModel>) => {
      try {
        const word = await putVocabularyWord(key, data);
        return { success: true, data: word };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        log.error(`IPC Error updating vocabulary word ${key}:`, error);
        return { success: false, error: errorMessage };
      }
    },
  );

  // Delete a vocabulary word
  ipcMain.handle(VocabularyIPCChannels.DELETE_WORD, async (_event, key: string) => {
    try {
      await deleteVocabularyWord(key);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log.error(`IPC Error deleting vocabulary word ${key}:`, error);
      return { success: false, error: errorMessage };
    }
  });

  // Update vocabulary word stats
  ipcMain.handle(
    VocabularyIPCChannels.UPDATE_WORD_STATS,
    async (
      _event,
      key: string,
      isCorrect: boolean,
      exerciseType: "multiple-choice" | "spell-word",
    ) => {
      try {
        await updateVocabularyWordStats(key, isCorrect, exerciseType);
        return { success: true };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        log.error(`IPC Error updating vocabulary word stats ${key}:`, error);
        return { success: false, error: errorMessage };
      }
    },
  );

  log.info("Vocabulary IPC handlers registered");
};