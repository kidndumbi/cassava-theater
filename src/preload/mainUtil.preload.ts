import { contextBridge, ipcRenderer } from "electron";
import { MainUtilIPCChannels } from "../enums/main-util-IPC-channels";

export function exposeMainUtilApi() {
  contextBridge.exposeInMainWorld("mainUtilAPI", {
    isPackaged: () => ipcRenderer.invoke(MainUtilIPCChannels.IS_PACKAGED) as Promise<boolean>,
    restart: () => ipcRenderer.send("restart-app"),
    openExternalLink: (url: string) =>
      ipcRenderer.invoke(MainUtilIPCChannels.OPEN_EXTERNAL_LINK, url) as Promise<void>,
    migrateData: (casLangDesktopUrl: string) =>
      ipcRenderer.invoke(MainUtilIPCChannels.MIGRATE_DATA, casLangDesktopUrl) as Promise<{ success: boolean; counts?: any; error?: string }>,
  });
}