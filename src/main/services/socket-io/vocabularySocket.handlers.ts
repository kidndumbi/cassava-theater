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
} from "../vocabularyDb.service";

type SocketCallback = (response: {
  success: boolean;
  data?: any;
  error?: string;
}) => void;

export function registerVocabularyHandlers(socket: Socket): void {
  socket.on(
    AppSocketEvents.VOCABULARY_GET_ALL,
    async (_requestData: unknown, callback: SocketCallback) => {
      try {
        log.info("Socket request: Get all vocabulary words");
        const words = await getAllVocabularyWords();
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
        const updated = await putVocabularyWord(data.id, data.word);
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
      data: { id: string; correct: boolean },
      callback: SocketCallback,
    ) => {
      try {
        await updateVocabularyWordStats(data.id, data.correct);
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
        callback({ success: true });
      } catch (error) {
        log.error(`Failed to delete vocabulary word ${data.id}:`, error);
        callback({ success: false, error: (error as Error).message });
      }
    },
  );
}
