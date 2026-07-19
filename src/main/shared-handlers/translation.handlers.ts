import { ipcMain } from "electron";
import { TranslationIPCChannels } from "../../enums/translationIPCChannels.enum";
import { translateSubtitles, getSupportedLanguages, detectLanguage, callLibreTranslate } from "../services/translation.service";

export const registerTranslationHandlers = {
  ipc(): void {
    ipcMain.handle(TranslationIPCChannels.TRANSLATE_SUBTITLES, async (_event, args: { vttFilePath: string; targetLanguage: string; sourceLanguage?: string; libretranslateUrl?: string }) => {
      const { vttFilePath, targetLanguage, sourceLanguage = "en", libretranslateUrl = "http://localhost:5000" } = args;
      if (!vttFilePath) throw new Error("VTT file path is not provided.");
      if (!targetLanguage) throw new Error("Target language is not provided.");
      return await translateSubtitles(vttFilePath, targetLanguage, sourceLanguage, libretranslateUrl);
    });
    ipcMain.handle(TranslationIPCChannels.TRANSLATE_TEXT, async (_event, args: { text: string; sourceLanguage: string; targetLanguage: string; libretranslateUrl?: string }) => {
      const { text, sourceLanguage, targetLanguage, libretranslateUrl = "http://localhost:5000" } = args;
      if (!text) throw new Error("Text is not provided for translation.");
      if (!sourceLanguage) throw new Error("Source language is not provided.");
      if (!targetLanguage) throw new Error("Target language is not provided.");
      return await callLibreTranslate(text, sourceLanguage, targetLanguage, libretranslateUrl);
    });
    ipcMain.handle(TranslationIPCChannels.GET_SUPPORTED_LANGUAGES, async (_event, libretranslateUrl?: string) => {
      return await getSupportedLanguages(libretranslateUrl);
    });
    ipcMain.handle(TranslationIPCChannels.DETECT_LANGUAGE, async (_event, args: { text: string; libretranslateUrl?: string }) => {
      const { text, libretranslateUrl = "http://localhost:5000" } = args;
      if (!text) throw new Error("Text is not provided for language detection.");
      return await detectLanguage(text, libretranslateUrl);
    });
  },
  // No Socket.IO equivalent — desktop-only feature
};