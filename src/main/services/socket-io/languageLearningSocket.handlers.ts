import { AppSocketEvents } from "../../../enums/app-socket-events.enum";
import { Socket } from "socket.io";
import { BrowserWindow } from "electron";
import { getCurrentLanguageLearningState, LanguageLearningState } from "../../ipc-handlers/languageLearningIpcHandlers";

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
      try {        const currentState = getCurrentLanguageLearningState();        callback({ success: true, data: currentState });
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
}