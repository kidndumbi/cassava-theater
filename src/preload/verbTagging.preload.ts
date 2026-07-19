import { contextBridge, ipcRenderer } from "electron";
import { VerbTaggingIPCChannels, VerbTaggingEvents } from "../enums/vocabularyIPCChannels.enum";

export function exposeVerbTaggingApi() {
  contextBridge.exposeInMainWorld("verbTaggingAPI", {
    start: (practiceLanguage: string, nativeLanguage: string, model: string) =>
      ipcRenderer.invoke(VerbTaggingIPCChannels.START, practiceLanguage, nativeLanguage, model),
    stop: () => ipcRenderer.invoke(VerbTaggingIPCChannels.STOP),
    getProgress: () => ipcRenderer.invoke(VerbTaggingIPCChannels.GET_PROGRESS),
    onProgressUpdate: (callback: (progress: any) => void) => {
      ipcRenderer.on(VerbTaggingEvents.PROGRESS_UPDATE, (_event, progress) => callback(progress));
    },
    onCompleted: (callback: (progress: any) => void) => {
      ipcRenderer.on(VerbTaggingEvents.COMPLETED, (_event, progress) => callback(progress));
    },
    onError: (callback: (error: { error: string }) => void) => {
      ipcRenderer.on(VerbTaggingEvents.ERROR, (_event, error) => callback(error));
    },
    removeAllListeners: () => {
      ipcRenderer.removeAllListeners(VerbTaggingEvents.PROGRESS_UPDATE);
      ipcRenderer.removeAllListeners(VerbTaggingEvents.COMPLETED);
      ipcRenderer.removeAllListeners(VerbTaggingEvents.ERROR);
    },
  });
}