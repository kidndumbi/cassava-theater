import { ipcMain } from "electron";
import { OpenDialogIpcChannels } from "../../enums/open-dialog-IPC-channels.enum";
import { openFileDialog, openFolderDialog } from "../services/openDialog.service";

export const registerOpenDialogHandlers = {
  ipc(): void {
    ipcMain.handle(OpenDialogIpcChannels.OPEN_FOLDER_DIALOG, openFolderDialog);
    ipcMain.handle(OpenDialogIpcChannels.OPEN_FILE_DIALOG, openFileDialog);
  },
  // No Socket.IO equivalent — desktop-only feature
};