import * as fs from "fs";
import { readFile, access } from "fs/promises";
import { Stats } from "fs";
import { loggingService as log } from "./main-logging.service";

export async function readOrDefaultJson(
  filePath: string,
  defaultData: any = { notes: [], overview: {} }
) {
  if (await fileExists(filePath)) {
    const file = await readFileData(filePath);
    return file ? JSON.parse(file) : defaultData;
  }
  return defaultData;
}

export async function readJsonData(jsonPath: string) {
  try {
    const exists = await fileExists(jsonPath);
    if (exists) {
      const jsonFile = await readFileData(jsonPath);
      const parsedData = JSON.parse(jsonFile || "");
      return parsedData;
    }
    return null;
  } catch (error) {
    log.error("Error in readJsonData:", error);
    throw error;
  }
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function readFileData(
  filePath: string
): Promise<string | undefined> {
  try {
    const jsonFile = await readFile(filePath);
    return jsonFile?.toString();
  } catch (error) {
    log.error("Error in readFileData:", error);
  }
}

export function shouldProcessFile(
  file: string,
  stats: Stats,
  searchText?: string
): boolean {
  return searchText &&
    !file.toLowerCase().includes(searchText.toLowerCase()) &&
    !stats.isDirectory()
    ? false
    : true;
}
