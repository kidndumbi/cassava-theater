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
  generateExerciseKey,
  calculateDifficulty,
} from "../languageLearningExerciseDb.service";
import { LanguageLearningExerciseModel } from "../../../models/language-learning-exercise.model";
import { loggingService as log } from "../main-logging.service";

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
        await putLanguageLearningExercise(data.id, data.exercise);
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
        const exerciseData = data.exercise;

        if (
          !exerciseData.videoFilePath ||
          exerciseData.startTime == null ||
          exerciseData.endTime == null
        ) {
          throw new Error(
            "Missing required exercise data: videoFilePath, startTime, endTime",
          );
        }

        const existingExercises = await getAllLanguageLearningExercises();

        // Check for duplicate practice text to prevent duplicates
        const isDuplicate = existingExercises.some(
          (exercise) =>
            exercise.practiceLanguageText === exerciseData.practiceLanguageText,
        );

        if (isDuplicate) {
          throw new Error(
            "An exercise with the same practice text already exists. Please modify the text to create a unique exercise.",
          );
        }

        const key = generateExerciseKey(
          exerciseData.startTime,
          exerciseData.endTime,
        );

        // Calculate difficulty if not provided
        if (!exerciseData.difficulty && exerciseData.practiceLanguageText) {
          exerciseData.difficulty = calculateDifficulty(
            exerciseData.practiceLanguageText,
          );
        }

        const savedExercise = await putLanguageLearningExercise(
          key,
          exerciseData,
        );
        log.info(`Successfully created exercise ${key}`);
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
      data: { id: string; correct: boolean },
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
        await updateExerciseStats(data.id, data.correct);
        log.info(`Successfully updated stats for exercise ${data.id}`);
        callback({ success: true });
      } catch (error) {
        log.error(`Failed to update exercise stats ${data.id}:`, error);
        callback({ success: false, error: (error as Error).message });
      }
    },
  );
}
