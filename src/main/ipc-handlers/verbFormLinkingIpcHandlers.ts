import { ipcMain } from "electron";
import { VerbFormLinkingIPCChannels, VerbFormLinkingEvents } from "../../enums/vocabularyIPCChannels.enum";
import { startVerbFormLinking, stopVerbFormLinking, getLinkingProgress, resetLinkingProgress } from "../services/verbFormLinking.service";
import { getMainWindow } from "../mainWindowManager";
import { loggingService as log } from "../services/main-logging.service";

export const verbFormLinkingIpcHandlers = () => {
  ipcMain.handle(
    VerbFormLinkingIPCChannels.START,
    async (_event, practiceLanguage: string, nativeLanguage: string, model: string) => {
      try {
        resetLinkingProgress();
        const mainWindow = getMainWindow();
        // Fire and forget so it runs in background
        startVerbFormLinking(practiceLanguage, nativeLanguage, model, mainWindow).catch(
          (err) => {
            log.error("Verb form linking background task error:", err);
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send(VerbFormLinkingEvents.ERROR, {
                error: err instanceof Error ? err.message : String(err),
              });
            }
          },
        );
        return { success: true };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        log.error("IPC Error starting verb form linking:", error);
        return { success: false, error: errorMessage };
      }
    },
  );

  ipcMain.handle(VerbFormLinkingIPCChannels.STOP, async () => {
    try {
      stopVerbFormLinking();
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log.error("IPC Error stopping verb form linking:", error);
      return { success: false, error: errorMessage };
    }
  });

  ipcMain.handle(VerbFormLinkingIPCChannels.GET_PROGRESS, async () => {
    try {
      return { success: true, data: getLinkingProgress() };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log.error("IPC Error getting verb form linking progress:", error);
      return { success: false, error: errorMessage };
    }
  });

  log.info("Verb form linking IPC handlers registered");
};