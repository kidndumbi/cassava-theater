import { Socket } from "socket.io";
import { AppSocketEvents } from "../../../enums/app-socket-events.enum";
import { loggingService as log } from "../main-logging.service";
import { VocabularyWordModel } from "../../../models/vocabulary-word.model";
import {
  getAllVocabularyWords,
  createVocabularyWord,
  putVocabularyWord,
  deleteVocabularyWord,
  updateVocabularyWordStats,
  getVocabularyWord,
} from "../vocabularyDb.service";
import {
  logVocabularyUpdate,
  logVocabularyPractice,
  getVocabularyLogs,
  deleteVocabularyLogs,
} from "../vocabularyLog.service";
import {
  logVocabularyPracticeSession,
  getAllVocabularySessionLogs,
} from "../vocabularySessionLog.service";

type SocketCallback = (response: {
  success: boolean;
  data?: any;
  error?: string;
}) => void;

export function registerVocabularyHandlers(socket: Socket): void {
  socket.on(
    AppSocketEvents.VOCABULARY_GET_ALL,
    async (requestData: { practiceLanguage?: string; nativeLanguage?: string }, callback: SocketCallback) => {
      try {
        log.info("Socket request: Get all vocabulary words");
        let words = await getAllVocabularyWords();
        if (requestData?.practiceLanguage) {
          words = words.filter((w) => w.practiceLanguage === requestData.practiceLanguage);
        }
        if (requestData?.nativeLanguage) {
          words = words.filter((w) => w.nativeLanguage === requestData.nativeLanguage);
        }
        callback({ success: true, data: words });
      } catch (error) {
        log.error("Failed to get all vocabulary words:", error);
        callback({ success: false, error: (error as Error).message });
      }
    },
  );

  socket.on(
    AppSocketEvents.VOCABULARY_CREATE,
    async (
      data: { word: Partial<VocabularyWordModel> },
      callback: SocketCallback,
    ) => {
      try {
        log.info("Socket request: Create vocabulary word");
        const saved = await createVocabularyWord(data.word);
        callback({ success: true, data: saved });
      } catch (error) {
        log.error("Failed to create vocabulary word:", error);
        callback({ success: false, error: (error as Error).message });
      }
    },
  );

  socket.on(
    AppSocketEvents.VOCABULARY_UPDATE,
    async (
      data: { id: string; word: Partial<VocabularyWordModel> },
      callback: SocketCallback,
    ) => {
      try {
        log.info(`Socket request: Update vocabulary word ${data.id}`);
        const before = await getVocabularyWord(data.id);
        const updated = await putVocabularyWord(data.id, data.word);
        if (before) {
          await logVocabularyUpdate(data.id, before as Record<string, any>, updated as Record<string, any>);
        }
        callback({ success: true, data: updated });
      } catch (error) {
        log.error(`Failed to update vocabulary word ${data.id}:`, error);
        callback({ success: false, error: (error as Error).message });
      }
    },
  );

  socket.on(
    AppSocketEvents.VOCABULARY_UPDATE_STATS,
    async (
      data: { id: string; correct: boolean; exerciseType?: "multiple-choice" | "spell-word" },
      callback: SocketCallback,
    ) => {
      try {
        await updateVocabularyWordStats(data.id, data.correct, data.exerciseType ?? "multiple-choice");
        await logVocabularyPractice(data.id, data.correct);
        await logVocabularyPracticeSession(data.id, data.correct);
        callback({ success: true });
      } catch (error) {
        log.error(`Failed to update vocabulary stats ${data.id}:`, error);
        callback({ success: false, error: (error as Error).message });
      }
    },
  );

  socket.on(
    AppSocketEvents.VOCABULARY_DELETE,
    async (data: { id: string }, callback: SocketCallback) => {
      try {
        log.info(`Socket request: Delete vocabulary word ${data.id}`);
        await deleteVocabularyWord(data.id);
        await deleteVocabularyLogs(data.id);
        callback({ success: true });
      } catch (error) {
        log.error(`Failed to delete vocabulary word ${data.id}:`, error);
        callback({ success: false, error: (error as Error).message });
      }
    },
  );

  socket.on(
    AppSocketEvents.VOCABULARY_GET_LOGS,
    async (data: { id: string }, callback: SocketCallback) => {
      try {
        log.info(`Socket request: Get vocabulary logs for word ${data.id}`);
        const logs = await getVocabularyLogs(data.id);
        callback({ success: true, data: logs });
      } catch (error) {
        log.error(`Failed to get vocabulary logs for ${data.id}:`, error);
        callback({ success: false, error: (error as Error).message });
      }
    },
  );

  socket.on(
    AppSocketEvents.VOCABULARY_GET_SESSION_LOGS,
    async (_requestData: unknown, callback: SocketCallback) => {
      try {
        log.info("Socket request: Get all vocabulary session logs");
        const logs = await getAllVocabularySessionLogs();
        callback({ success: true, data: logs });
      } catch (error) {
        log.error("Failed to get vocabulary session logs:", error);
        callback({ success: false, error: (error as Error).message });
      }
    },
  );
}
