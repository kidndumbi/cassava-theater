import { contextBridge, ipcRenderer } from "electron";
import { LanguageLearningIPCChannels } from "../enums/llm-IPC-Channels.enum";

export function exposeLanguageLearningApi() {
  contextBridge.exposeInMainWorld("languageLearningAPI", {
    sendMessage: (channel: string, data?: any) => {
      ipcRenderer.send(channel, data);
    },
    on: (channel: string, callback: (...args: any[]) => void) => {
      ipcRenderer.on(channel, callback);
    },
    removeAllListeners: (channel: string) => {
      ipcRenderer.removeAllListeners(channel);
    },
    saveExercise: (exerciseData: any) =>
      ipcRenderer.invoke(LanguageLearningIPCChannels.SAVE_EXERCISE, exerciseData),
    getExercise: (key: string) =>
      ipcRenderer.invoke(LanguageLearningIPCChannels.GET_EXERCISE, key),
    getExercisesByVideo: (videoFilePath: string) =>
      ipcRenderer.invoke(LanguageLearningIPCChannels.GET_EXERCISES_BY_VIDEO, videoFilePath),
    getAllExercises: () =>
      ipcRenderer.invoke(LanguageLearningIPCChannels.GET_ALL_EXERCISES),
    deleteExercise: (key: string) =>
      ipcRenderer.invoke(LanguageLearningIPCChannels.DELETE_EXERCISE, key),
    updateExercise: (key: string, exerciseData: any) =>
      ipcRenderer.invoke(LanguageLearningIPCChannels.UPDATE_EXERCISE, key, exerciseData),
    updateExerciseStats: (key: string, isCorrect: boolean, snapshot?: { userAnswer: string; correctAnswer: string; nativeText: string; practiceMode?: 'arrange-words' | 'fill-in-missing' | 'spell-the-blanks' | 'conversation'; options?: string[] }) =>
      ipcRenderer.invoke(LanguageLearningIPCChannels.UPDATE_EXERCISE_STATS, key, isCorrect, snapshot),
    getExerciseLogs: (key: string) =>
      ipcRenderer.invoke(LanguageLearningIPCChannels.GET_EXERCISE_LOGS, key),
  });
}