import { BrowserWindow } from "electron";
import { getAllVocabularyWords, putVocabularyWord } from "./vocabularyDb.service";
import { VerbFormLinkingEvents } from "../../enums/vocabularyIPCChannels.enum";
import { loggingService as log } from "./main-logging.service";
import OpenAI from "openai";
import { getAllSettings } from "./settingsDataDb.service";

export interface VerbFormLinkingProgress {
  current: number;
  total: number;
  status: "idle" | "running" | "stopping" | "completed" | "error";
  linkedWords: Array<{ formWord: string; formId: string; infinitiveWord: string; infinitiveId: string }>;
  error?: string;
}

let linkingProgress: VerbFormLinkingProgress = {
  current: 0,
  total: 0,
  status: "idle",
  linkedWords: [],
};

let shouldStopLinking = false;

function getLinkingProgress(): VerbFormLinkingProgress {
  return { ...linkingProgress };
}

function resetLinkingProgress(): void {
  shouldStopLinking = false;
  linkingProgress = {
    current: 0,
    total: 0,
    status: "idle",
    linkedWords: [],
  };
}

async function sendLinkingProgressUpdate(mainWindow: BrowserWindow | null): Promise<void> {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(VerbFormLinkingEvents.PROGRESS_UPDATE, getLinkingProgress());
  }
}

async function generateWithLLM(
  prompt: string,
  model: string,
): Promise<string> {
  if (model === "deepseek") {
    const settings = await getAllSettings();
    const key = (settings?.deepseekApiKey ?? "").trim();
    if (!key) throw new Error("No DeepSeek API key configured.");
    const client = new OpenAI({
      apiKey: key,
      baseURL: "https://api.deepseek.com",
    });
    const res = await client.chat.completions.create({
      model: "deepseek-chat",
      messages: [{ role: "user", content: prompt }],
      stream: false,
    });
    return res.choices[0]?.message?.content?.trim() ?? "";
  }

  // Use Ollama
  const axios = (await import("axios")).default;
  const response = await axios.post("http://localhost:11434/api/generate", {
    model,
    prompt,
    stream: false,
  });
  return response.data?.response?.trim() ?? "";
}

/**
 * Ask LLM: given a conjugated verb form, return its infinitive.
 */
async function findInfinitive(
  word: string,
  practiceLanguage: string,
  nativeLanguage: string,
  model: string,
): Promise<string | null> {
  const langNames: Record<string, string> = { en: "English", es: "Spanish", fr: "French" };
  const langName = langNames[practiceLanguage] || practiceLanguage;
  const nativeName = langNames[nativeLanguage] || nativeLanguage;

  const prompt =
    `You are a linguistics expert. I will give you a conjugated verb form in ${langName}.\n` +
    `Return ONLY the infinitive (dictionary) form of this verb and its translation in ${nativeName}, ` +
    `separated by |. Do NOT include any explanation or extra text.\n\n` +
    `Examples:\n` +
    `- "tengo" → tener|to have\n` +
    `- "habló" → hablar|to speak/to talk\n` +
    `- "comimos" → comer|to eat\n\n` +
    `Word: "${word}"\n\n` +
    `Respond with ONLY: infinitive|translation`;

  try {
    const result = await generateWithLLM(prompt, model);
    const trimmed = result.trim();
    const parts = trimmed.split("|");
    if (parts.length >= 1 && parts[0].trim()) {
      return parts[0].trim();
    }
    return null;
  } catch (err) {
    log.error(`Error finding infinitive for "${word}":`, err);
    throw err;
  }
}

export async function startVerbFormLinking(
  practiceLanguage: string,
  nativeLanguage: string,
  model: string,
  mainWindow: BrowserWindow | null,
): Promise<void> {
  shouldStopLinking = false;

  // Get ALL vocab words (no tag filter — we're only linking forms)
  const allWords = await getAllVocabularyWords();
  // Skip words that already have a parentVerbId (already linked)
  const wordsInLang = allWords.filter(
    (w) => w.practiceLanguage === practiceLanguage && !w.parentVerbId,
  );

  linkingProgress = {
    current: 0,
    total: wordsInLang.length,
    status: "running",
    linkedWords: [],
  };

  await sendLinkingProgressUpdate(mainWindow);

  for (const word of wordsInLang) {
    if (shouldStopLinking) {
      linkingProgress.status = "stopping";
      await sendLinkingProgressUpdate(mainWindow);
      return;
    }

    try {
      // Ask LLM for the infinitive of this word
      const infinitive = await findInfinitive(
        word.word,
        practiceLanguage,
        nativeLanguage,
        model,
      );

      if (infinitive) {
        // Check if this infinitive exists in the DB
        const parentWord = allWords.find(
          (w) =>
            w.word.toLowerCase() === infinitive.toLowerCase() &&
            w.practiceLanguage === practiceLanguage &&
            w.id !== word.id, // don't match self
        );

        if (parentWord) {
          // Link: set parentVerbId on the form word to the infinitive's id
          await putVocabularyWord(word.id, { parentVerbId: parentWord.id });
          linkingProgress.linkedWords.push({
            formWord: word.word,
            formId: word.id,
            infinitiveWord: parentWord.word,
            infinitiveId: parentWord.id,
          });
        }
        // If infinitive doesn't exist in DB, skip — no creation, per requirements
      }
    } catch (err) {
      log.error(`Error processing word "${word.word}" for form linking:`, err);
    }

    linkingProgress.current++;
    await sendLinkingProgressUpdate(mainWindow);
  }

  if (!shouldStopLinking) {
    linkingProgress.status = "completed";
    await sendLinkingProgressUpdate(mainWindow);
  } else {
    linkingProgress.status = "stopping";
    await sendLinkingProgressUpdate(mainWindow);
  }
}

export function stopVerbFormLinking(): void {
  shouldStopLinking = true;
}

export { getLinkingProgress, resetLinkingProgress };