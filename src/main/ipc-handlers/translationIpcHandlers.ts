import { ipcMain } from "electron";
import { translateSubtitles, getSupportedLanguages, detectLanguage } from "../services/translation.service";
import { TranslationIPCChannels } from "../../enums/translationIPCChannels.enum";

export const translationIpcHandlers = () => {
  ipcMain.handle(
    TranslationIPCChannels.TRANSLATE_SUBTITLES,
    async (_event: Electron.IpcMainInvokeEvent, args: {
      vttFilePath: string;
      targetLanguage: string;
      sourceLanguage?: string;
      libretranslateUrl?: string;
    }) => {
      try {
        const { vttFilePath, targetLanguage, sourceLanguage = "en", libretranslateUrl = "http://localhost:5000" } = args;
        if (!vttFilePath) {
          throw new Error("VTT file path is not provided.");
        }
        if (!targetLanguage) {
          throw new Error("Target language is not provided.");
        }
        return await translateSubtitles(vttFilePath, targetLanguage, sourceLanguage, libretranslateUrl);
      } catch (error: unknown) {
        if (error instanceof Error) {
          throw new Error(`Error translating subtitles: ${error.message}`);
        } else {
          throw new Error("Error translating subtitles: Unknown error");
        }
      }
    }
  );

  ipcMain.handle(
    TranslationIPCChannels.GET_SUPPORTED_LANGUAGES,
    async (_event: Electron.IpcMainInvokeEvent, libretranslateUrl?: string) => {
      try {
        return await getSupportedLanguages(libretranslateUrl);
      } catch (error: unknown) {
        if (error instanceof Error) {
          throw new Error(`Error fetching supported languages: ${error.message}`);
        } else {
          throw new Error("Error fetching supported languages: Unknown error");
        }
      }
    }
  );

  ipcMain.handle(
    TranslationIPCChannels.DETECT_LANGUAGE,
    async (_event: Electron.IpcMainInvokeEvent, args: {
      text: string;
      libretranslateUrl?: string;
    }) => {
      try {
        const { text, libretranslateUrl = "http://localhost:5000" } = args;
        if (!text) {
          throw new Error("Text is not provided for language detection.");
        }
        return await detectLanguage(text, libretranslateUrl);
      } catch (error: unknown) {
        if (error instanceof Error) {
          throw new Error(`Error detecting language: ${error.message}`);
        } else {
          throw new Error("Error detecting language: Unknown error");
        }
      }
    }
  );
};