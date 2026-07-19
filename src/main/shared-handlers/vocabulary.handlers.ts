import { ipcMain } from "electron";
import { Socket } from "socket.io";
import { VocabularyIPCChannels } from "../../enums/vocabularyIPCChannels.enum";
import { AppSocketEvents } from "../../enums/app-socket-events.enum";
import {
  getAllVocabularyWords, getVocabularyWord, createVocabularyWord,
  putVocabularyWord, deleteVocabularyWord, updateVocabularyWordStats,
} from "../services/vocabularyDb.service";
import { loggingService as log } from "../services/main-logging.service";

export const registerVocabularyHandlers = {
  ipc(): void {
    ipcMain.handle(VocabularyIPCChannels.GET_ALL_WORDS, async () => {
      try { const words = await getAllVocabularyWords(); return { success: true, data: words }; }
      catch (error) { const msg = error instanceof Error ? error.message : String(error); return { success: false, error: msg }; }
    });
    ipcMain.handle(VocabularyIPCChannels.GET_WORD, async (_event, key: string) => {
      try { const word = await getVocabularyWord(key); return { success: true, data: word }; }
      catch (error) { const msg = error instanceof Error ? error.message : String(error); return { success: false, error: msg }; }
    });
    ipcMain.handle(VocabularyIPCChannels.CREATE_WORD, async (_event, data: Partial<import("../../models/vocabulary-word.model").VocabularyWordModel>) => {
      try { const word = await createVocabularyWord(data); return { success: true, data: word }; }
      catch (error) { const msg = error instanceof Error ? error.message : String(error); return { success: false, error: msg }; }
    });
    ipcMain.handle(VocabularyIPCChannels.UPDATE_WORD, async (_event, key: string, data: Partial<import("../../models/vocabulary-word.model").VocabularyWordModel>) => {
      try { const word = await putVocabularyWord(key, data); return { success: true, data: word }; }
      catch (error) { const msg = error instanceof Error ? error.message : String(error); return { success: false, error: msg }; }
    });
    ipcMain.handle(VocabularyIPCChannels.DELETE_WORD, async (_event, key: string) => {
      try { await deleteVocabularyWord(key); return { success: true }; }
      catch (error) { const msg = error instanceof Error ? error.message : String(error); return { success: false, error: msg }; }
    });
    ipcMain.handle(VocabularyIPCChannels.UPDATE_WORD_STATS, async (_event, key: string, isCorrect: boolean, exerciseType: "multiple-choice" | "spell-word") => {
      try { await updateVocabularyWordStats(key, isCorrect, exerciseType); return { success: true }; }
      catch (error) { const msg = error instanceof Error ? error.message : String(error); return { success: false, error: msg }; }
    });
  },

  socket(socket: Socket): void {
    socket.on(AppSocketEvents.VOCABULARY_GET_ALL, async (_req: unknown, callback: (r: { success: boolean; data?: any[]; error?: string }) => void) => {
      try { const words = await getAllVocabularyWords(); callback({ success: true, data: words }); }
      catch (error) { log.error("Error getting vocabulary:", error); callback({ success: false, error: "Failed to get vocabulary" }); }
    });
    socket.on(AppSocketEvents.VOCABULARY_CREATE, async (requestData: { data: any }, callback: (r: { success: boolean; data?: any; error?: string }) => void) => {
      try { const word = await createVocabularyWord(requestData.data); callback({ success: true, data: word }); }
      catch (error) { log.error("Error creating vocabulary:", error); callback({ success: false, error: "Failed to create vocabulary" }); }
    });
    socket.on(AppSocketEvents.VOCABULARY_UPDATE, async (requestData: { data: { key: string; data: any } }, callback: (r: { success: boolean; data?: any; error?: string }) => void) => {
      try { const word = await putVocabularyWord(requestData.data.key, requestData.data.data); callback({ success: true, data: word }); }
      catch (error) { log.error("Error updating vocabulary:", error); callback({ success: false, error: "Failed to update vocabulary" }); }
    });
    socket.on(AppSocketEvents.VOCABULARY_UPDATE_STATS, async (requestData: { data: { key: string; isCorrect: boolean; exerciseType: "multiple-choice" | "spell-word" } }, callback: (r: { success: boolean; error?: string }) => void) => {
      try { await updateVocabularyWordStats(requestData.data.key, requestData.data.isCorrect, requestData.data.exerciseType); callback({ success: true }); }
      catch (error) { log.error("Error updating vocab stats:", error); callback({ success: false, error: "Failed to update vocab stats" }); }
    });
    socket.on(AppSocketEvents.VOCABULARY_DELETE, async (requestData: { data: { key: string } }, callback: (r: { success: boolean; error?: string }) => void) => {
      try { await deleteVocabularyWord(requestData.data.key); callback({ success: true }); }
      catch (error) { log.error("Error deleting vocabulary:", error); callback({ success: false, error: "Failed to delete vocabulary" }); }
    });
  },
};