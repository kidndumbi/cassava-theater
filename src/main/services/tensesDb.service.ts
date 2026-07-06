import { levelDBService } from "./levelDB.service";
import { loggingService as log } from "./main-logging.service";
import { v4 as uuidv4 } from "uuid";

const COLLECTION_NAME = "verbTenses";

export interface VerbTensesData {
  word: string;
  indicativeSimple: VerbTenseData[];
  indicativeCompound: VerbTenseData[];
  subjunctiveSimple: VerbTenseData[];
  subjunctiveCompound: VerbTenseData[];
  imperative: VerbTenseData[];
}

export interface VerbTenseData {
  tenseName: string;
  description: string;
  entries: TenseEntry[];
}

export interface TenseEntry {
  pronoun: string;
  conjugation: string;
  translation: string;
}

/**
 * Retrieves verb tenses data by its ID.
 */
export const getTenses = async (
  tensesId: string,
): Promise<VerbTensesData | null> => {
  try {
    return (await levelDBService.get(COLLECTION_NAME, tensesId)) as VerbTensesData;
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: string }).code === "LEVEL_NOT_FOUND"
    ) {
      return null;
    }
    log.error(`Error getting tenses ${tensesId}:`, error);
    throw error;
  }
};

/**
 * Saves verb tenses data and returns the generated UUID.
 * If an ID is already present on the data object (via (data as any).id), that ID is reused.
 * This allows the migration script to preserve existing IDs.
 */
export const saveTenses = async (
  data: VerbTensesData & { id?: string },
): Promise<string> => {
  try {
    const key = data.id || uuidv4();
    // Clean the data — remove the id property before storing
    const { id, ...cleanData } = data;
    await levelDBService.put(COLLECTION_NAME, key, cleanData);
    log.info(`Saved tenses data: ${key}`);
    return key;
  } catch (error) {
    log.error("Error saving tenses data:", error);
    throw error;
  }
};

/**
 * Deletes verb tenses data by its ID.
 */
export const deleteTenses = async (tensesId: string): Promise<void> => {
  try {
    await levelDBService.delete(COLLECTION_NAME, tensesId);
    log.info(`Deleted tenses data: ${tensesId}`);
  } catch (error) {
    log.error(`Error deleting tenses ${tensesId}:`, error);
    throw error;
  }
};