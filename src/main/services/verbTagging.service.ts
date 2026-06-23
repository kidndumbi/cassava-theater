import { BrowserWindow } from "electron";
import { getAllVocabularyWords, createVocabularyWord, putVocabularyWord } from "./vocabularyDb.service";
import { VocabularyWordModel } from "../../models/vocabulary-word.model";
import { VerbTaggingEvents } from "../../enums/vocabularyIPCChannels.enum";
import { loggingService as log } from "./main-logging.service";
import OpenAI from "openai";
import { getAllSettings } from "./settingsDataDb.service";

export interface VerbTaggingProgress {
  current: number;
  total: number;
  status: "idle" | "running" | "stopping" | "completed" | "error";
  updatedWords: Array<{ word: string; translation: string; id: string }>;
  createdWords: Array<{ word: string; translation: string }>;
  error?: string;
}

let progressState: VerbTaggingProgress = {
  current: 0,
  total: 0,
  status: "idle",
  updatedWords: [],
  createdWords: [],
};

let shouldStop = false;

function getProgress(): VerbTaggingProgress {
  return { ...progressState };
}

function resetProgress(): void {
  shouldStop = false;
  progressState = {
    current: 0,
    total: 0,
    status: "idle",
    updatedWords: [],
    createdWords: [],
  };
}

async function sendProgressUpdate(mainWindow: BrowserWindow | null): Promise<void> {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(VerbTaggingEvents.PROGRESS_UPDATE, getProgress());
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

interface VerbCheckResult {
  isVerb: boolean;
  parentVerb?: string;
  parentVerbTranslation?: string;
}

/**
 * Ask LLM if a word is a verb, and if it's a conjugated form, provide the parent verb + translation.
 */
async function checkIsVerb(
  word: string,
  practiceLanguage: string,
  nativeLanguage: string,
  model: string,
): Promise<VerbCheckResult> {
  const langNames: Record<string, string> = { en: "English", es: "Spanish", fr: "French" };
  const langName = langNames[practiceLanguage] || practiceLanguage;
  const nativeName = langNames[nativeLanguage] || nativeLanguage;

  const prompt =
    `You are a linguistics expert. I will give you a word in ${langName}.\n` +
    `Determine if the word is a verb or a conjugated form of a verb.\n\n` +
    `Rules:\n` +
    `- If the word IS the infinitive/dictionary form of a verb, respond with: VERB\n` +
`- If the word is a CONJUGATED form of a verb (not the infinitive), respond with: CONJUGATED|<parent infinitive verb>|<abridged meanings of parent verb in ${nativeName}, separated by />\n` +
    `- If the word is NOT a verb and NOT a conjugated form of a verb, respond with: NO\n\n` +
    `Important:\n` +
    `- For Spanish, the infinitive forms end in -ar, -er, or -ir.\n` +
    `- For French, the infinitive forms end in -er, -ir, -re, or -oir.\n` +
    `- For English, the infinitive is the base form (often with "to").\n` +
    `- "tener" is a verb (infinitive). "tengo" is conjugated from "tener".\n` +
`- "tengo" should return: CONJUGATED|tener|to have/to possess\n` +
    `- "casa" should return: NO\n` +
    `- "hablar" should return: VERB\n\n` +
    `Word to analyze: "${word}"\n\n` +
    `Respond with ONLY one of the three formats above. No explanation, no extra text.`;

  try {
    const result = await generateWithLLM(prompt, model);
    const trimmed = result.trim();

    if (trimmed === "VERB") {
      return { isVerb: true };
    }

    if (trimmed.startsWith("CONJUGATED|")) {
      const parts = trimmed.split("|");
      if (parts.length >= 3) {
        return {
          isVerb: true,
          parentVerb: parts[1].trim(),
          parentVerbTranslation: parts[2].trim(),
        };
      }
      // Fallback: if format is wrong but starts with CONJUGATED
      return { isVerb: false };
    }

    return { isVerb: false };
  } catch (err) {
    log.error(`Error checking if "${word}" is a verb:`, err);
    throw err;
  }
}

export async function startVerbTagging(
  practiceLanguage: string,
  nativeLanguage: string,
  model: string,
  mainWindow: BrowserWindow | null,
): Promise<void> {
  shouldStop = false;

  // Get all vocab words
  const allWords = await getAllVocabularyWords();
  // Filter to practice language and those that don't already have the "verb" tag
  const wordsToCheck = allWords.filter(
    (w) =>
      w.practiceLanguage === practiceLanguage &&
      (!w.tags || !w.tags.includes("verb")),
  );

  progressState = {
    current: 0,
    total: wordsToCheck.length,
    status: "running",
    updatedWords: [],
    createdWords: [],
  };

  await sendProgressUpdate(mainWindow);

  for (const word of wordsToCheck) {
    if (shouldStop) {
      progressState.status = "stopping";
      await sendProgressUpdate(mainWindow);
      return;
    }

    try {
      const result = await checkIsVerb(
        word.word,
        practiceLanguage,
        nativeLanguage,
        model,
      );

      if (result.isVerb && result.parentVerb) {
        // This is a conjugated form — need to add parent verb
        const parentExists = allWords.some(
          (w) =>
            w.word.toLowerCase() === result.parentVerb!.toLowerCase() &&
            w.practiceLanguage === practiceLanguage,
        );

        if (!parentExists) {
          // Create the parent verb
          try {
            const newWord = await createVocabularyWord({
              word: result.parentVerb,
              translation: result.parentVerbTranslation || "",
              practiceLanguage: practiceLanguage as "en" | "es" | "fr",
              nativeLanguage: nativeLanguage as "en" | "es" | "fr",
              tags: ["verb"],
              createdAt: Date.now(),
              practiceCount: 0,
              correctCount: 0,
              accuracyRate: 0,
            });
            progressState.createdWords.push({
              word: result.parentVerb,
              translation: result.parentVerbTranslation || "",
            });
            // Add to local cache so subsequent lookups work
            allWords.push(newWord);
          } catch (createErr: any) {
            // If duplicate, just ignore
            if (!createErr?.message?.includes("already exists")) {
              log.error(`Error creating parent verb "${result.parentVerb}":`, createErr);
            }
          }
        }

        // Add "verb" tag to the current (conjugated) word
        const updatedTags = [...(word.tags || []), "verb"].filter(
          (t, i, arr) => arr.indexOf(t) === i,
        );
        await putVocabularyWord(word.id, { tags: updatedTags });
        progressState.updatedWords.push({
          word: word.word,
          translation: word.translation || "",
          id: word.id,
        });

        // Also add "verb" tag to the parent if it exists in allWords
        const parentWord = allWords.find(
          (w) =>
            w.word.toLowerCase() === result.parentVerb!.toLowerCase() &&
            w.practiceLanguage === practiceLanguage,
        );
        if (parentWord && (!parentWord.tags || !parentWord.tags.includes("verb"))) {
          const parentTags = [...(parentWord.tags || []), "verb"].filter(
            (t, i, arr) => arr.indexOf(t) === i,
          );
          await putVocabularyWord(parentWord.id, { tags: parentTags });
        }
      } else if (result.isVerb) {
        // Direct verb — just add the tag
        const updatedTags = [...(word.tags || []), "verb"].filter(
          (t, i, arr) => arr.indexOf(t) === i,
        );
        await putVocabularyWord(word.id, { tags: updatedTags });
        progressState.updatedWords.push({
          word: word.word,
          translation: word.translation || "",
          id: word.id,
        });
      }
      // else: not a verb, do nothing
    } catch (err) {
      log.error(`Error processing word "${word.word}":`, err);
      // Continue to next word
    }

    progressState.current++;
    await sendProgressUpdate(mainWindow);
  }

  if (!shouldStop) {
    progressState.status = "completed";
    await sendProgressUpdate(mainWindow);
  } else {
    progressState.status = "stopping";
    await sendProgressUpdate(mainWindow);
  }
}

export function stopVerbTagging(): void {
  shouldStop = true;
}

export { getProgress, resetProgress };