import { contextBridge, ipcRenderer } from "electron";
import { TranslationIPCChannels } from "../enums/translationIPCChannels.enum";

export function exposeTranslationApi() {
  contextBridge.exposeInMainWorld("translationAPI", {
    translateSubtitles: (args: { vttFilePath: string; targetLanguage: string; sourceLanguage?: string; libretranslateUrl?: string }) =>
      ipcRenderer.invoke(TranslationIPCChannels.TRANSLATE_SUBTITLES, args) as Promise<string>,
    translateText: (args: { text: string; sourceLanguage: string; targetLanguage: string; libretranslateUrl?: string }) =>
      ipcRenderer.invoke(TranslationIPCChannels.TRANSLATE_TEXT, args) as Promise<string>,
    getSupportedLanguages: (libretranslateUrl?: string) =>
      ipcRenderer.invoke(TranslationIPCChannels.GET_SUPPORTED_LANGUAGES, libretranslateUrl) as Promise<Array<{ code: string; name: string }>>,
    detectLanguage: (args: { text: string; libretranslateUrl?: string }) =>
      ipcRenderer.invoke(TranslationIPCChannels.DETECT_LANGUAGE, args) as Promise<string>,
  });
}