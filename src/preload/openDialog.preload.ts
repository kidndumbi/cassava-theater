import { contextBridge, ipcRenderer } from "electron";
import { OpenDialogIpcChannels } from "../enums/open-dialog-IPC-channels.enum";

export function exposeOpenDialogApi() {
  contextBridge.exposeInMainWorld("openDialogAPI", {
    openFileDialog: (filters?: { name: string; extensions: string[] }[]) =>
      ipcRenderer.invoke(OpenDialogIpcChannels.OPEN_FILE_DIALOG, filters) as Promise<string | null>,
    openFolderDialog: () =>
      ipcRenderer.invoke(OpenDialogIpcChannels.OPEN_FOLDER_DIALOG) as Promise<string | null>,
  });
}