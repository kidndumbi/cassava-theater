import { AppSocketEvents } from "../../../enums/app-socket-events.enum";
import { Socket } from "socket.io";
import { BrowserWindow } from "electron";
import {
  getCurrentLanguageLearningState,
  LanguageLearningState,
} from "../../ipc-handlers/languageLearningIpcHandlers";
import {
  getAllLanguageLearningExercises,
  putLanguageLearningExercise,
  updateExerciseStats,
  deleteLanguageLearningExercise,
} from "../languageLearningExerciseDb.service";
import { createLanguageLearningExercise } from "../languageLearning.service";
import { getAllSessionLogs } from "../sessionLog.service";
import {
  logExerciseUpdate,
  getExerciseLogs,
  deleteExerciseLogs,
} from "../exerciseLog.service";
import { LanguageLearningExerciseModel } from "../../../models/language-learning-exercise.model";
import { PracticeSessionLog } from "../../../models/practice-session-log.model";
import { ExerciseLogs } from "../../../models/exercise-log.model";
import { loggingService as log } from "../main-logging.service";
import { callLibreTranslate } from "../translation.service";

export function registerLanguageLearningHandlers(
  socket: Socket,
  mainWindow: BrowserWindow,
) {
  // Get current language learning state
  socket.on(
    AppSocketEvents.LANGUAGE_LEARNING_GET_STATE,
    async (
      _requestData: unknown,
      callback: (response: {
        success: boolean;
        data?: LanguageLearningState;
        error?: string;
      }) => void,
    ) => {
      try {
        const currentState = getCurrentLanguageLearningState();
        callback({ success: true, data: currentState });
      } catch (error) {
        callback({ success: false, error: (error as Error).message });
      }
    },
  );

  // Handle word selection
  socket.on(
    AppSocketEvents.LANGUAGE_LEARNING_SELECT_WORD,
    (data: { word: string; index: number }) => {
      mainWindow.webContents.send("language-learning-select-word", data);
    },
  );

  // Handle word removal
  socket.on(
    AppSocketEvents.LANGUAGE_LEARNING_REMOVE_WORD,
    (data: { index: number }) => {
      mainWindow.webContents.send("language-learning-remove-word", data);
    },
  );

  // Handle exercise submission
  socket.on(AppSocketEvents.LANGUAGE_LEARNING_SUBMIT, () => {
    mainWindow.webContents.send("language-learning-submit");
  });

  // Handle exercise reset
  socket.on(AppSocketEvents.LANGUAGE_LEARNING_RESET, () => {
    mainWindow.webContents.send("language-learning-reset");
  });

  // Mobile app handlers
  // Get all exercises for mobile app
  socket.on(
    AppSocketEvents.LANGUAGE_LEARNING_GET_ALL_EXERCISES,
    async (
      _requestData: unknown,
      callback: (response: {
        success: boolean;
        data?: LanguageLearningExerciseModel[];
        error?: string;
      }) => void,
    ) => {
      try {
        log.info("Socket request: Get all language learning exercises");
        const exercises = await getAllLanguageLearningExercises();
        log.info(`Found ${exercises.length} language learning exercises`);
        callback({ success: true, data: exercises });
      } catch (error) {
        log.error("Failed to get all exercises:", error);
        callback({ success: false, error: (error as Error).message });
      }
    },
  );

  // Update exercise (for favorites and editing)
  socket.on(
    AppSocketEvents.LANGUAGE_LEARNING_UPDATE_EXERCISE,
    async (
      data: { id: string; exercise: LanguageLearningExerciseModel },
      callback: (response: {
        success: boolean;
        data?: LanguageLearningExerciseModel;
        error?: string;
      }) => void,
    ) => {
      try {
        log.info(
          `Socket request: Update language learning exercise ${data.id}`,
        );
        const before = await getAllLanguageLearningExercises().then(
          (all) => all.find((e) => e.id === data.id) ?? {},
        );
        await putLanguageLearningExercise(data.id, data.exercise);
        await logExerciseUpdate(
          data.id,
          before as Record<string, any>,
          data.exercise as Record<string, any>,
        );
        log.info(`Successfully updated exercise ${data.id}`);
        callback({ success: true, data: data.exercise });
      } catch (error) {
        log.error(`Failed to update exercise ${data.id}:`, error);
        callback({ success: false, error: (error as Error).message });
      }
    },
  );

  // Create new exercise (for manual creation)
  socket.on(
    AppSocketEvents.LANGUAGE_LEARNING_CREATE_EXERCISE,
    async (
      data: { exercise: Partial<LanguageLearningExerciseModel> },
      callback: (response: {
        success: boolean;
        data?: LanguageLearningExerciseModel;
        error?: string;
      }) => void,
    ) => {
      try {
        log.info("Socket request: Create new language learning exercise");
        const savedExercise = await createLanguageLearningExercise(data.exercise);
        callback({ success: true, data: savedExercise });
      } catch (error) {
        log.error("Failed to create exercise:", error);
        callback({ success: false, error: (error as Error).message });
      }
    },
  );

  // Update exercise stats (for practice tracking)
  socket.on(
    AppSocketEvents.LANGUAGE_LEARNING_UPDATE_EXERCISE_STATS,
    async (
      data: { id: string; correct: boolean; snapshot?: { userAnswer: string; correctAnswer: string; nativeText: string } },
      callback: (response: {
        success: boolean;
        data?: any;
        error?: string;
      }) => void,
    ) => {
      try {
        log.info(
          `Socket request: Update exercise stats ${data.id}, correct: ${data.correct}`,
        );
        await updateExerciseStats(data.id, data.correct, data.snapshot);
        log.info(`Successfully updated stats for exercise ${data.id}`);
        callback({ success: true });
      } catch (error) {
        log.error(`Failed to update exercise stats ${data.id}:`, error);
        callback({ success: false, error: (error as Error).message });
      }
    },
  );

  socket.on(
    AppSocketEvents.LANGUAGE_LEARNING_DELETE_EXERCISE,
    async (
      data: { id: string },
      callback: (response: {
        success: boolean;
        data?: any;
        error?: string;
      }) => void,
    ) => {
      try {
        log.info(`Socket request: Delete exercise ${data.id}`);
        await deleteLanguageLearningExercise(data.id);
        await deleteExerciseLogs(data.id);
        log.info(`Successfully deleted exercise ${data.id}`);
        callback({ success: true });
      } catch (error) {
        log.error(`Failed to delete exercise ${data.id}:`, error);
        callback({ success: false, error: (error as Error).message });
      }
    },
  );

  socket.on(
    AppSocketEvents.TRANSLATE_TEXT,
    async (
      response: {
        data: {
          text: string;
          sourceLanguage: string;
          targetLanguage: string;
          libretranslateUrl?: string;
        };
      },
      callback: (response: {
        success: boolean;
        data?: string;
        error?: string;
      }) => void,
    ) => {
      try {
        const {
          text,
          sourceLanguage,
          targetLanguage,
          libretranslateUrl = "http://localhost:5000",
        } = response.data;

        if (!text) {
          throw new Error("Text is not provided for translation.");
        }
        if (!sourceLanguage) {
          throw new Error("Source language is not provided for translation.");
        }
        if (!targetLanguage) {
          throw new Error("Target language is not provided for translation.");
        }
        const translatedText = await callLibreTranslate(
          text,
          sourceLanguage,
          targetLanguage,
          libretranslateUrl,
        );
        callback({ success: true, data: translatedText });
      } catch (error) {
        callback({ success: false, error: (error as Error).message });
      }
    },
  );

  // Get exercise logs for a specific exercise
  socket.on(
    AppSocketEvents.LANGUAGE_LEARNING_GET_EXERCISE_LOGS,
    async (
      data: { id: string },
      callback: (response: {
        success: boolean;
        data?: ExerciseLogs;
        error?: string;
      }) => void,
    ) => {
      try {
        log.info(`Socket request: Get exercise logs for ${data.id}`);
        const logs = await getExerciseLogs(data.id);
        callback({ success: true, data: logs });
      } catch (error) {
        log.error(`Failed to get exercise logs for ${data.id}:`, error);
        callback({ success: false, error: (error as Error).message });
      }
    },
  );

  // Get all session logs (for overview/statistics page)
  socket.on(
    AppSocketEvents.LANGUAGE_LEARNING_GET_SESSION_LOGS,
    async (
      _requestData: unknown,
      callback: (response: {
        success: boolean;
        data?: PracticeSessionLog[];
        error?: string;
      }) => void,
    ) => {
      try {
        log.info("Socket request: Get all practice session logs");
        const logs = await getAllSessionLogs();
        callback({ success: true, data: logs });
      } catch (error) {
        log.error("Failed to get session logs:", error);
        callback({ success: false, error: (error as Error).message });
      }
    },
  );
}
