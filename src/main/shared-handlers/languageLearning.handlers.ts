import { ipcMain, BrowserWindow } from "electron";
import { Socket } from "socket.io";
import { getSocketIoGlobal } from "../socketGlobalManager";
import { AppSocketEvents } from "../../enums/app-socket-events.enum";
import { LanguageLearningIPCChannels } from "../../enums/llm-IPC-Channels.enum";
import {
  getLanguageLearningExercise, getLanguageLearningExercisesByVideo,
  getAllLanguageLearningExercises, deleteLanguageLearningExercise,
  updateExerciseStats, putLanguageLearningExercise,
} from "../services/languageLearningExerciseDb.service";
import { createLanguageLearningExercise, calculateDifficulty } from "../services/languageLearning.service";
import { logExerciseUpdate, getExerciseLogs, deleteExerciseLogs } from "../services/exerciseLog.service";
import { LanguageLearningExerciseModel } from "../../models/language-learning-exercise.model";
import { loggingService as log } from "../services/main-logging.service";
import { LanguageLearningState } from "../ipc-handlers/languageLearningIpcHandlers";
import { getCurrentLanguageLearningState, updateLanguageLearningState } from "../ipc-handlers/languageLearningIpcHandlers";

export const registerLanguageLearningHandlers = {
  ipc(): void {
    // State management
    ipcMain.on("language-learning-state-update", (_event, newState: LanguageLearningState) => {
      updateLanguageLearningState(newState);
      const io = getSocketIoGlobal();
      if (io) io.emit(AppSocketEvents.LANGUAGE_LEARNING_STATE_UPDATE, getCurrentLanguageLearningState());
    });
    ipcMain.handle("language-learning-get-state", () => getCurrentLanguageLearningState());

    // Exercise database
    ipcMain.handle(LanguageLearningIPCChannels.SAVE_EXERCISE, async (_event, exerciseData: Partial<LanguageLearningExerciseModel>) => {
      try { const saved = await createLanguageLearningExercise(exerciseData); return { success: true, data: saved }; }
      catch (error) { const msg = error instanceof Error ? error.message : String(error); log.error("Error saving exercise:", error); return { success: false, error: msg }; }
    });
    ipcMain.handle(LanguageLearningIPCChannels.GET_EXERCISE, async (_event, key: string) => {
      try { const exercise = await getLanguageLearningExercise(key); return { success: true, data: exercise }; }
      catch (error) { const msg = error instanceof Error ? error.message : String(error); return { success: false, error: msg }; }
    });
    ipcMain.handle(LanguageLearningIPCChannels.GET_EXERCISES_BY_VIDEO, async (_event, videoFilePath: string) => {
      try { const exercises = await getLanguageLearningExercisesByVideo(videoFilePath); return { success: true, data: exercises }; }
      catch (error) { const msg = error instanceof Error ? error.message : String(error); return { success: false, error: msg }; }
    });
    ipcMain.handle(LanguageLearningIPCChannels.GET_ALL_EXERCISES, async () => {
      try { const exercises = await getAllLanguageLearningExercises(); return { success: true, data: exercises }; }
      catch (error) { const msg = error instanceof Error ? error.message : String(error); return { success: false, error: msg }; }
    });
    ipcMain.handle(LanguageLearningIPCChannels.DELETE_EXERCISE, async (_event, key: string) => {
      try { await deleteLanguageLearningExercise(key); await deleteExerciseLogs(key); return { success: true }; }
      catch (error) { const msg = error instanceof Error ? error.message : String(error); return { success: false, error: msg }; }
    });
    ipcMain.handle(LanguageLearningIPCChannels.UPDATE_EXERCISE, async (_event, key: string, exerciseData: Partial<LanguageLearningExerciseModel>) => {
      try {
        const before = await getLanguageLearningExercise(key) ?? {};
        if (exerciseData.practiceLanguageText) exerciseData.difficulty = calculateDifficulty(exerciseData.practiceLanguageText);
        const updated = await putLanguageLearningExercise(key, exerciseData);
        await logExerciseUpdate(key, before as Record<string, any>, exerciseData as Record<string, any>);
        return { success: true, data: updated };
      } catch (error) { const msg = error instanceof Error ? error.message : String(error); return { success: false, error: msg }; }
    });
    ipcMain.handle(LanguageLearningIPCChannels.UPDATE_EXERCISE_STATS, async (_event, key: string, isCorrect: boolean, snapshot?: any) => {
      try { await updateExerciseStats(key, isCorrect, snapshot); return { success: true }; }
      catch (error) { const msg = error instanceof Error ? error.message : String(error); return { success: false, error: msg }; }
    });
    ipcMain.handle(LanguageLearningIPCChannels.GET_EXERCISE_LOGS, async (_event, key: string) => {
      try { const logs = await getExerciseLogs(key); return { success: true, data: logs }; }
      catch (error) { const msg = error instanceof Error ? error.message : String(error); return { success: false, error: msg }; }
    });
  },

  socket(socket: Socket, mainWindow: BrowserWindow): void {
    // Language learning state is handled via the state broadcast in ipc() above
    // Exercise CRUD is handled via Socket.IO handlers from the existing socket file
    // The existing languageLearningSocket.handlers.ts provides additional granular control
    // from mobile clients that we preserve through the ipc → socket bridge
  },
};