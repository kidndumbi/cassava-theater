import { ipcMain } from "electron";
import { getSocketIoGlobal } from "../socketGlobalManager";
import { AppSocketEvents } from "../../enums/app-socket-events.enum";
import { LanguageLearningIPCChannels } from "../../enums/llm-IPC-Channels.enum";
import {
  putLanguageLearningExercise,
  getLanguageLearningExercise,
  getLanguageLearningExercisesByVideo,
  getAllLanguageLearningExercises,
  deleteLanguageLearningExercise,
  updateExerciseStats,
  generateExerciseKey,
  calculateDifficulty
} from "../services/languageLearningExerciseDb.service";
import { LanguageLearningExerciseModel } from "../../models/language-learning-exercise.model";
import { loggingService as log } from "../services/main-logging.service";

export interface LanguageLearningState {
  activeCue: {
    id: string;
    text: string;
    startTime: number;
    endTime: number;
  } | null;
  activeNativeCue: {
    id: string;
    text: string;
    startTime: number;
    endTime: number;
  } | null;
  scrambledWords: string[];
  selectedWords: string[];
  originalText: string;
  showResult: boolean;
  isCorrect: boolean;
  exerciseCompleted: boolean;
  enabled: boolean;
}

let currentState: LanguageLearningState = {
  activeCue: null,
  activeNativeCue: null,
  scrambledWords: [],
  selectedWords: [],
  originalText: '',
  showResult: false,
  isCorrect: false,
  exerciseCompleted: false,
  enabled: false
};

export const languageLearningIpcHandlers = () => {
  // Handle state updates from renderer
  ipcMain.on('language-learning-state-update', (_event, newState: LanguageLearningState) => {
    currentState = { ...currentState, ...newState };
    
    // Broadcast to all connected socket clients
    const io = getSocketIoGlobal();
    if (io) {
      io.emit(AppSocketEvents.LANGUAGE_LEARNING_STATE_UPDATE, currentState);
    }
  });

  // Handle getting current state
  ipcMain.handle('language-learning-get-state', () => {
    return currentState;
  });

  // Exercise Database Handlers
  
  // Save exercise data
  ipcMain.handle(LanguageLearningIPCChannels.SAVE_EXERCISE, async (_event, exerciseData: Partial<LanguageLearningExerciseModel>) => {
    try {
      console.log('=== SAVING LANGUAGE LEARNING EXERCISE ===');
      console.log('Received exercise data:', JSON.stringify(exerciseData, null, 2));
      
      if (!exerciseData.videoFilePath || !exerciseData.startTime || !exerciseData.endTime) {
        throw new Error('Missing required exercise data: videoFilePath, startTime, endTime');
      }

      const key = generateExerciseKey(
        exerciseData.videoFilePath,
        exerciseData.startTime,
        exerciseData.endTime
      );
      console.log('Generated exercise key:', key);

      // Calculate difficulty if not provided
      if (!exerciseData.difficulty && exerciseData.practiceLanguageText) {
        exerciseData.difficulty = calculateDifficulty(exerciseData.practiceLanguageText);
        console.log('Calculated difficulty:', exerciseData.difficulty);
      }

      const savedExercise = await putLanguageLearningExercise(key, exerciseData);
      console.log('Successfully saved exercise:', JSON.stringify(savedExercise, null, 2));
      console.log('==========================================');
      
      log.info(`Exercise saved: ${key}`);
      return { success: true, data: savedExercise };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log.error('Error saving exercise:', error);
      return { success: false, error: errorMessage };
    }
  });

  // Get specific exercise
  ipcMain.handle(LanguageLearningIPCChannels.GET_EXERCISE, async (_event, key: string) => {
    try {
      const exercise = await getLanguageLearningExercise(key);
      return { success: true, data: exercise };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log.error(`Error getting exercise ${key}:`, error);
      return { success: false, error: errorMessage };
    }
  });

  // Get exercises by video
  ipcMain.handle(LanguageLearningIPCChannels.GET_EXERCISES_BY_VIDEO, async (_event, videoFilePath: string) => {
    try {
      const exercises = await getLanguageLearningExercisesByVideo(videoFilePath);
      return { success: true, data: exercises };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log.error(`Error getting exercises for video ${videoFilePath}:`, error);
      return { success: false, error: errorMessage };
    }
  });

  // Get all exercises
  ipcMain.handle(LanguageLearningIPCChannels.GET_ALL_EXERCISES, async () => {
    try {
      const exercises = await getAllLanguageLearningExercises();
      return { success: true, data: exercises };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log.error('Error getting all exercises:', error);
      return { success: false, error: errorMessage };
    }
  });

  // Delete exercise
  ipcMain.handle(LanguageLearningIPCChannels.DELETE_EXERCISE, async (_event, key: string) => {
    try {
      await deleteLanguageLearningExercise(key);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log.error(`Error deleting exercise ${key}:`, error);
      return { success: false, error: errorMessage };
    }
  });

  // Update exercise
  ipcMain.handle(LanguageLearningIPCChannels.UPDATE_EXERCISE, async (_event, key: string, exerciseData: Partial<LanguageLearningExerciseModel>) => {
    try {
      console.log('=== UPDATING LANGUAGE LEARNING EXERCISE ===');
      console.log('Exercise key:', key);
      console.log('Update data:', JSON.stringify(exerciseData, null, 2));
      
      // Recalculate difficulty if practice text changed
      if (exerciseData.practiceLanguageText) {
        exerciseData.difficulty = calculateDifficulty(exerciseData.practiceLanguageText);
        console.log('Recalculated difficulty:', exerciseData.difficulty);
      }
      
      const updatedExercise = await putLanguageLearningExercise(key, exerciseData);
      console.log('Successfully updated exercise:', JSON.stringify(updatedExercise, null, 2));
      console.log('============================================');
      
      log.info(`Exercise updated: ${key}`);
      return { success: true, data: updatedExercise };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log.error(`Error updating exercise ${key}:`, error);
      return { success: false, error: errorMessage };
    }
  });

  // Update exercise statistics
  ipcMain.handle(LanguageLearningIPCChannels.UPDATE_EXERCISE_STATS, async (_event, key: string, isCorrect: boolean) => {
    try {
      await updateExerciseStats(key, isCorrect);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log.error(`Error updating exercise stats ${key}:`, error);
      return { success: false, error: errorMessage };
    }
  });
};

export function getCurrentLanguageLearningState(): LanguageLearningState {
  return currentState;
}

export function updateLanguageLearningState(newState: Partial<LanguageLearningState>) {
  currentState = { ...currentState, ...newState };
}