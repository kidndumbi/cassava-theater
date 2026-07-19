import { ipcMain, app, shell } from "electron";
import { MainUtilIPCChannels } from "../../enums/main-util-IPC-channels";
import { migrateDataToCasLangDesktop } from "../services/migration.service";

export const registerMainUtilHandlers = {
  ipc(): void {
    ipcMain.handle(MainUtilIPCChannels.IS_PACKAGED, () => app.isPackaged);
    ipcMain.handle(MainUtilIPCChannels.OPEN_EXTERNAL_LINK, async (_event, url: string) => {
      await shell.openExternal(url);
    });
    ipcMain.handle(MainUtilIPCChannels.MIGRATE_DATA, async (_event, casLangDesktopUrl: string) => {
      return await migrateDataToCasLangDesktop(casLangDesktopUrl);
    });
  },
  // No Socket.IO equivalent — desktop-only feature
};