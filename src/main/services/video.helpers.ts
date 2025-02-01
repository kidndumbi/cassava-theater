import { readFile, access, writeFile } from "fs/promises";
import { Stats } from "fs";
import { loggingService as log } from "./main-logging.service";
import { VideoDataModel } from "../../models/videoData.model";

export const filterByCategory = (
  videos: VideoDataModel[],
  category: string
) => {
  if (["movies", "episodes"].includes(category)) {
    return videos.filter((vid) => /\.[^.]+$/.test(vid.fileName!));
  }
  return videos;
};

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

export const getJsonFilePath = (filePath: string): string => {
  if (!filePath) {
    throw new Error("filePath is undefined!");
  }

  // Check if the filePath ends with .mp4 and replace it with .json
  if (filePath.endsWith(".mp4")) {
    return filePath.replace(".mp4", ".json");
  }

  // Check if the filePath has no extension and append .json
  if (!filePath.includes(".")) {
    return `${filePath}.json`;
  }

  // If neither condition is met, return the filePath as is
  return filePath;
};

export const readJsonFile = async (
  filePath: string
): Promise<VideoDataModel | null> => {
  const jsonFile = await readFileData(filePath);
  return jsonFile ? (JSON.parse(jsonFile) as VideoDataModel) : null;
};

export const writeJsonToFile = async (
  filePath: string,
  jsonData: VideoDataModel
): Promise<VideoDataModel> => {
  await writeFile(filePath, JSON.stringify(jsonData, null, 2));
  return jsonData;
};
