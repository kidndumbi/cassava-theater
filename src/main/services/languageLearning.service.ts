import { LanguageLearningExerciseModel } from "../../models/language-learning-exercise.model";
import { loggingService as log } from "./main-logging.service";
import {
  getAllLanguageLearningExercises,
  putLanguageLearningExercise,
  generateExerciseKey,
} from "./languageLearningExerciseDb.service";

export const calculateDifficulty = (
  text: string,
): "easy" | "medium" | "hard" => {
  const cleanText = text.replace(/[^\w\s]/g, "").trim();
  const words = cleanText.split(/\s+/).filter((word) => word.length > 0);

  if (words.length === 0) return "easy";

  const wordCount = words.length;
  const avgWordLength =
    words.reduce((sum, word) => sum + word.length, 0) / wordCount;

  if (wordCount === 1) {
    if (avgWordLength <= 6) return "easy";
    if (avgWordLength <= 10) return "medium";
    return "hard";
  }

  let difficultyScore = 0;

  if (wordCount <= 3) difficultyScore += 0;
  else if (wordCount <= 8) difficultyScore += 1;
  else if (wordCount <= 15) difficultyScore += 2;
  else difficultyScore += 3;

  if (avgWordLength <= 4) difficultyScore += 0;
  else if (avgWordLength <= 6) difficultyScore += 1;
  else if (avgWordLength <= 8) difficultyScore += 2;
  else difficultyScore += 3;

  const hasLongWords = words.some((word) => word.length > 12);
  if (hasLongWords) difficultyScore += 1;

  if (difficultyScore <= 1) return "easy";
  if (difficultyScore <= 3) return "medium";
  return "hard";
};

export const createLanguageLearningExercise = async (
  exerciseData: Partial<LanguageLearningExerciseModel>,
): Promise<LanguageLearningExerciseModel> => {
  if (
    !exerciseData.videoFilePath ||
    exerciseData.startTime == null ||
    exerciseData.endTime == null
  ) {
    throw new Error(
      "Missing required exercise data: videoFilePath, startTime, endTime",
    );
  }

  const existingExercises = await getAllLanguageLearningExercises();

  const isDuplicate = existingExercises.some(
    (exercise) =>
      exercise.practiceLanguageText === exerciseData.practiceLanguageText,
  );

  if (isDuplicate) {
    throw new Error(
      "An exercise with the same practice text already exists. Please modify the text to create a unique exercise.",
    );
  }

  const key = generateExerciseKey(exerciseData.startTime, exerciseData.endTime);

  if (!exerciseData.difficulty && exerciseData.practiceLanguageText) {
    exerciseData.difficulty = calculateDifficulty(
      exerciseData.practiceLanguageText,
    );
  }

  const savedExercise = await putLanguageLearningExercise(key, exerciseData);
  log.info(`Exercise created: ${key}`);
  return savedExercise;
};
