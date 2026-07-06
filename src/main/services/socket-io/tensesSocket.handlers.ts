import { Socket } from "socket.io";
import { AppSocketEvents } from "../../../enums/app-socket-events.enum";
import { loggingService as log } from "../main-logging.service";
import {
  getTenses,
  saveTenses,
  deleteTenses,
  VerbTensesData,
} from "../tensesDb.service";
import { putVocabularyWord } from "../vocabularyDb.service";

type SocketCallback = (response: {
  success: boolean;
  data?: any;
  error?: string;
}) => void;

export function registerTensesHandlers(socket: Socket): void {
  // ── Get tenses by ID ────────────────────────────────────────────────────
  socket.on(
    AppSocketEvents.VOCABULARY_GET_TENSES,
    async (data: { tensesId: string }, callback: SocketCallback) => {
      try {
        log.info(`Socket request: Get tenses ${data.tensesId}`);
        const tenses = await getTenses(data.tensesId);
        if (!tenses) {
          callback({ success: false, error: "Tenses not found" });
          return;
        }
        callback({ success: true, data: tenses });
      } catch (error) {
        log.error(`Failed to get tenses ${data.tensesId}:`, error);
        callback({ success: false, error: (error as Error).message });
      }
    },
  );

  // ── Save tenses data and link to word ────────────────────────────────────
  socket.on(
    AppSocketEvents.VOCABULARY_SAVE_TENSES,
    async (
      data: { wordId: string; data: VerbTensesData & { id?: string } },
      callback: SocketCallback,
    ) => {
      try {
        log.info(`Socket request: Save tenses for word ${data.wordId}`);
        const tensesId = await saveTenses(data.data);
        // Patch the word's tensesId
        await putVocabularyWord(data.wordId, { tensesId });
        log.info(`Linked tenses ${tensesId} to word ${data.wordId}`);
        callback({ success: true, data: { tensesId } });
      } catch (error) {
        log.error(`Failed to save tenses for word ${data.wordId}:`, error);
        callback({ success: false, error: (error as Error).message });
      }
    },
  );

  // ── Delete tenses and unlink from word ───────────────────────────────────
  socket.on(
    AppSocketEvents.VOCABULARY_DELETE_TENSES,
    async (
      data: { wordId: string; tensesId: string },
      callback: SocketCallback,
    ) => {
      try {
        log.info(`Socket request: Delete tenses ${data.tensesId} for word ${data.wordId}`);
        await deleteTenses(data.tensesId);
        // Remove the tensesId from the word (set to undefined)
        await putVocabularyWord(data.wordId, { tensesId: undefined as any });
        log.info(`Unlinked tenses from word ${data.wordId}`);
        callback({ success: true });
      } catch (error) {
        log.error(`Failed to delete tenses for word ${data.wordId}:`, error);
        callback({ success: false, error: (error as Error).message });
      }
    },
  );
}