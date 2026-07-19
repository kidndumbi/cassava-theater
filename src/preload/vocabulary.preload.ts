import { contextBridge, ipcRenderer } from "electron";
import { VocabularyIPCChannels } from "../enums/vocabularyIPCChannels.enum";

export function exposeVocabularyApi() {
  contextBridge.exposeInMainWorld("vocabularyAPI", {
    getAllWords: () => ipcRenderer.invoke(VocabularyIPCChannels.GET_ALL_WORDS),
    getWord: (key: string) => ipcRenderer.invoke(VocabularyIPCChannels.GET_WORD, key),
    createWord: (data: any) => ipcRenderer.invoke(VocabularyIPCChannels.CREATE_WORD, data),
    updateWord: (key: string, data: any) => ipcRenderer.invoke(VocabularyIPCChannels.UPDATE_WORD, key, data),
    deleteWord: (key: string) => ipcRenderer.invoke(VocabularyIPCChannels.DELETE_WORD, key),
    updateWordStats: (key: string, isCorrect: boolean, exerciseType: "multiple-choice" | "spell-word") =>
      ipcRenderer.invoke(VocabularyIPCChannels.UPDATE_WORD_STATS, key, isCorrect, exerciseType),
  });
}