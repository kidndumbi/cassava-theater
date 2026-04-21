import { ipcMain } from "electron";
import { getSocketIoGlobal } from "../socketGlobalManager";
import { AppSocketEvents } from "../../enums/app-socket-events.enum";

export interface LanguageLearningState {
  activeCue: {
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
};

export function getCurrentLanguageLearningState(): LanguageLearningState {
  return currentState;
}

export function updateLanguageLearningState(newState: Partial<LanguageLearningState>) {
  currentState = { ...currentState, ...newState };
}