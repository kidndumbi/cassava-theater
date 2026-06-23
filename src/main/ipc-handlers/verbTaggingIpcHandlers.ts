import { ipcMain } from "electron";
import { VerbTaggingIPCChannels, VerbTaggingEvents } from "../../enums/vocabularyIPCChannels.enum";
import { startVerbTagging, stopVerbTagging, getProgress, resetProgress } from "../services/verbTagging.service";
import { getMainWindow } from "../mainWindowManager";
import { loggingService as log } from "../services/main-logging.service";

export const verbTaggingIpcHandlers = () => {
  ipcMain.handle(
    VerbTaggingIPCChannels.START,
    async (_event, practiceLanguage: string, nativeLanguage: string, model: string) => {
      try {
        resetProgress();
        const mainWindow = getMainWindow();
        // Don't await — fire and forget so it runs in background
        startVerbTagging(practiceLanguage, nativeLanguage, model, mainWindow).catch(
          (err) => {
            log.error("Verb tagging background task error:", err);
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send(VerbTaggingEvents.ERROR, {
                error: err instanceof Error ? err.message : String(err),
              });
            }
          },
        );
        return { success: true };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        log.error("IPC Error starting verb tagging:", error);
        return { success: false, error: errorMessage };
      }
    },
  );

  ipcMain.handle(VerbTaggingIPCChannels.STOP, async () => {
    try {
      stopVerbTagging();
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log.error("IPC Error stopping verb tagging:", error);
      return { success: false, error: errorMessage };
    }
  });

  ipcMain.handle(VerbTaggingIPCChannels.GET_PROGRESS, async () => {
    try {
      return { success: true, data: getProgress() };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log.error("IPC Error getting verb tagging progress:", error);
      return { success: false, error: errorMessage };
    }
  });

  log.info("Verb tagging IPC handlers registered");
};