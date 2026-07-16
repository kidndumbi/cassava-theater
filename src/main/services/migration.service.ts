import { levelDBService } from "./levelDB.service";
import { loggingService as log } from "./main-logging.service";
import { getAllVocabularyWords } from "./vocabularyDb.service";
import { getAllLanguageLearningExercises } from "./languageLearningExerciseDb.service";
import { getAllTags } from "./tagService";
import { getAllVocabularySessionLogs } from "./vocabularySessionLog.service";
import { getAllSessionLogs } from "./sessionLog.service";

export const migrateDataToCasLangDesktop = async (
  casLangDesktopUrl: string,
): Promise<{ success: boolean; counts?: any; error?: string }> => {
  try {
    log.info("Starting data migration to cas-lang-desktop...");

    const vocabulary = await getAllVocabularyWords();
    log.info(`Read ${vocabulary.length} vocabulary words`);

    const vocabularyLogs: Record<string, any> = {};
    try {
      const allLogs = await levelDBService.getAll("vocabularyLogs");
      for (const log of allLogs || []) {
        if (log.wordId) vocabularyLogs[log.wordId] = log;
      }
    } catch (e) { log.error("Error reading vocabulary logs:", e); }

    const vocabularySessionLogs = await getAllVocabularySessionLogs();
    log.info(`Read ${vocabularySessionLogs.length} vocabulary session logs`);

    const exercises = await getAllLanguageLearningExercises();
    log.info(`Read ${exercises.length} exercises`);

    const exerciseLogs: Record<string, any> = {};
    try {
      const allLogs = await levelDBService.getAll("exerciseLogs");
      for (const log of allLogs || []) {
        if (log.exerciseId) exerciseLogs[log.exerciseId] = log;
      }
    } catch (e) { log.error("Error reading exercise logs:", e); }

    const exerciseSessionLogs = await getAllSessionLogs();
    log.info(`Read ${exerciseSessionLogs.length} exercise session logs`);

    const tags = await getAllTags();
    log.info(`Read ${tags.length} tags`);

    const tenses: Array<[string, any]> = [];
    try {
      const rawTenses = await levelDBService.getRawAll("verbTenses");
      for (const { key, value } of rawTenses || []) {
        tenses.push([key, value]);
      }
    } catch (e) { log.error("Error reading tenses:", e); }
    log.info(`Read ${tenses.length} verb tenses`);

    const exerciseAiConversations: any[] = [];
    try {
      const conversations = await levelDBService.getRawAll("exerciseAiChats");
      for (const { value } of conversations || []) {
        exerciseAiConversations.push(value);
      }
    } catch (e) { log.error("Error reading AI conversations:", e); }
    log.info(`Read ${exerciseAiConversations.length} AI conversations`);

    const payload = {
      vocabulary,
      vocabularyLogs,
      vocabularySessionLogs,
      exercises,
      exerciseLogs,
      exerciseSessionLogs,
      tags,
      tenses,
      exerciseAiConversations,
    };

    const url = `${casLangDesktopUrl}/api/migrate`;
    log.info(`POSTing migration data to ${url}...`);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Migration endpoint returned ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    log.info("Migration completed:", result);
    return { success: true, counts: result };
  } catch (error) {
    log.error("Migration failed:", error);
    return { success: false, error: (error as Error).message || String(error) };
  }
};