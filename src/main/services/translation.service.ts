import { loggingService as log } from "./main-logging.service";
import * as path from "path";
import * as fs from "fs";
import { putLanguageLearningExercise, generateExerciseKey, calculateDifficulty, getAllLanguageLearningExercises } from "./languageLearningExerciseDb.service";
import { LanguageLearningExerciseModel } from "../../models/language-learning-exercise.model";

/**
 * Extract video file path from VTT file path
 */
function getVideoFilePathFromVTT(vttFilePath: string): string {
  const dir = path.dirname(vttFilePath);
  const baseName = path.basename(vttFilePath, '.vtt');
  
  // Remove language suffixes like .en, .es, etc.
  const cleanBaseName = baseName.replace(/\.(en|es|fr)$/, '');
  
  // Common video extensions
  const videoExtensions = ['.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm'];
  
  // Try to find the actual video file
  for (const ext of videoExtensions) {
    const videoPath = path.join(dir, cleanBaseName + ext);
    if (fs.existsSync(videoPath)) {
      return videoPath;
    }
  }
  
  // If no video file found, return assumed mp4 path
  return path.join(dir, cleanBaseName + '.mp4');
}

/**
 * Parse VTT timestamp to seconds
 */
function parseVTTTimestamp(timestamp: string): number {
  const [hours, minutes, secondsWithMs] = timestamp.split(':');
  const [seconds, milliseconds] = secondsWithMs.split(/[.,]/);
  
  return parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds) + (parseInt(milliseconds || '0') / 1000);
}

/**
 * Parse VTT timestamp line to get start and end times
 */
function parseVTTTimestampLine(timestampLine: string): { startTime: number; endTime: number } {
  const [startTimeStr, endTimeStr] = timestampLine.split(' --> ');
  return {
    startTime: parseVTTTimestamp(startTimeStr.trim()),
    endTime: parseVTTTimestamp(endTimeStr.trim())
  };
}

/**
 * Save language learning exercise from translation
 */
async function saveLanguageLearningExercise(
  originalText: string,
  translatedText: string,
  sourceLanguage: string,
  targetLanguage: string,
  timestampLine: string,
  vttFilePath: string,
  existingExercises: LanguageLearningExerciseModel[]
): Promise<void> {
  try {
    // Parse timestamps
    const { startTime, endTime } = parseVTTTimestampLine(timestampLine);
    
    // Get video file path and filename
    const videoFilePath = getVideoFilePathFromVTT(vttFilePath);
    const videoFileName = path.basename(videoFilePath);
    
    // Calculate exercise properties - exclude standalone dashes from word count
    const wordsWithoutDashes = originalText.replace(/\s+-\s+/g, ' ').split(/\s+/).filter(word => word.length > 0 && word !== '-');
    const wordCount = wordsWithoutDashes.length;
    const difficulty = calculateDifficulty(originalText);
    const duration = endTime - startTime;
    
    // Skip very short or very long texts (minimum 4 words)
    if (wordCount < 4 || wordCount > 25 || originalText.length < 10) {
      return;
    }
    
    // Determine practice text based on target language
    const practiceText = targetLanguage === 'en' ? originalText : translatedText;
    
    // Check for duplicate practice text to prevent duplicates
    const isDuplicate = existingExercises.some(exercise => 
      exercise.practiceLanguageText === practiceText
    );
    
    if (isDuplicate) {
      log.info(`Skipping duplicate exercise text: "${practiceText.substring(0, 50)}..."`); 
      return;
    }
    
    // Create exercise model
    const exercise: Partial<LanguageLearningExerciseModel> = {
      videoFilePath,
      videoFileName,
      nativeLanguageText: targetLanguage === 'en' ? translatedText : originalText,
      practiceLanguageText: targetLanguage === 'en' ? originalText : translatedText,
      nativeLanguage: (targetLanguage === 'en' ? targetLanguage : sourceLanguage) as 'en' | 'es' | 'fr',
      practiceLanguage: (targetLanguage === 'en' ? sourceLanguage : targetLanguage) as 'en' | 'es' | 'fr',
      startTime,
      endTime,
      duration,
      wordCount,
      difficulty,
      createdAt: Date.now(),
      tags: []
    };
    
    // Validate that languages are different (same validation as in LanguageLearning component)
    if (exercise.nativeLanguage === exercise.practiceLanguage) {
      log.warn(`Skipping exercise - same languages: ${exercise.nativeLanguage}`);
      return;
    }
    
    // Generate unique key
    const exerciseKey = generateExerciseKey(videoFilePath, startTime, endTime);
    
    // Save to database
    await putLanguageLearningExercise(exerciseKey, exercise);
    
    log.info(`Created language learning exercise: ${exercise.practiceLanguage} → ${exercise.nativeLanguage}, ${wordCount} words`);
    
  } catch (error) {
    log.error(`Failed to save language learning exercise:`, error);
  }
}

export async function translateSubtitles(
  vttFilePath: string,
  targetLanguage = "es",
  sourceLanguage = "en",
  libretranslateUrl = "http://localhost:5000"
): Promise<string> {
  // Validate file extension
  if (path.extname(vttFilePath).toLowerCase() !== ".vtt") {
    throw new Error("Invalid file type. Expected a .vtt file.");
  }

  // Check if file exists
  if (!fs.existsSync(vttFilePath)) {
    throw new Error(`VTT file not found: ${vttFilePath}`);
  }

  try {
    log.info(`Translating subtitles from ${sourceLanguage} to ${targetLanguage}: ${vttFilePath}`);

    // Fetch all existing exercises once for duplicate checking
    const existingExercises = await getAllLanguageLearningExercises();
    log.info(`Loaded ${existingExercises.length} existing exercises for duplicate checking`);

    // Read the VTT file content
    const vttContent = fs.readFileSync(vttFilePath, { encoding: "utf-8" });
    const lines = vttContent.split("\n");

    // Parse VTT structure
    const translatedLines: string[] = [];
    let i = 0;
    let subtitleBlockCount = 0;
    let exercisesCreated = 0;

    while (i < lines.length) {
      const line = lines[i];
      const trimmedLine = line.trim();

      // Keep WEBVTT header
      if (line === "WEBVTT" || line === "" || /^\d+$/.test(trimmedLine)) {
        translatedLines.push(line);
        i++;
        continue;
      }

      // Keep timestamp lines - handle multiple VTT formats
      // Supports: HH:MM:SS.mmm --> HH:MM:SS.mmm (dots) and HH:MM:SS,mmm --> HH:MM:SS,mmm (commas)
      // Also handles variable digit counts for seconds/milliseconds
      if (/^\d{1,2}:\d{2}:\d{1,2}[.,]\d{1,3} --> \d{1,2}:\d{2}:\d{1,2}[.,]\d{1,3}$/.test(trimmedLine)) {
        translatedLines.push(line);
        const timestampLine = trimmedLine; // Store for language exercise
        i++;
        subtitleBlockCount++;

        // Collect all subtitle text lines for this subtitle block
        const textLines: string[] = [];
        
        while (i < lines.length && lines[i].trim() !== "" && !/^\d+$/.test(lines[i].trim()) && !/^\d{1,2}:\d{2}:\d{1,2}[.,]\d{1,3} --> \d{1,2}:\d{2}:\d{1,2}[.,]\d{1,3}$/.test(lines[i].trim())) {
          textLines.push(lines[i]);
          i++;
        }

        // Translate the text if it exists
        if (textLines.length > 0) {
          const textToTranslate = textLines.join(" ").trim();
          
          if (textToTranslate) {
            try {
              const translatedText = await callLibreTranslate(textToTranslate, sourceLanguage, targetLanguage, libretranslateUrl);
              
              // Check if translation actually occurred (simple heuristic)
              if (translatedText === textToTranslate) {
                log.warn(`Translation returned identical text - LibreTranslate may not be working properly`);
              } else {
                // Save as language learning exercise (only if translation was successful and different)
                try {
                  await saveLanguageLearningExercise(
                    textToTranslate,
                    translatedText, 
                    sourceLanguage,
                    targetLanguage,
                    timestampLine,
                    vttFilePath,
                    existingExercises
                  );
                  exercisesCreated++;
                } catch (exerciseError) {
                  log.error(`Failed to save language exercise:`, exerciseError);
                }
              }
              
              // Split translated text back into lines if needed (preserve line breaks)
              const translatedLines_local = translatedText.split(" ");
              const wordsPerLine = Math.ceil(translatedLines_local.length / textLines.length);
              
              let wordIndex = 0;
              for (let lineIndex = 0; lineIndex < textLines.length; lineIndex++) {
                const lineWords = translatedLines_local.slice(wordIndex, wordIndex + wordsPerLine);
                translatedLines.push(lineWords.join(" "));
                wordIndex += wordsPerLine;
              }
            } catch (translationError) {
              log.error(`Translation failed for text: ${textToTranslate}`, translationError);
              // Keep original text if translation fails
              textLines.forEach(textLine => translatedLines.push(textLine));
            }
          }
        }

        continue;
      }

      // Keep other lines as-is
      translatedLines.push(line);
      i++;
    }
    
    log.info(`Processed ${subtitleBlockCount} subtitle blocks`);
    log.info(`Created ${exercisesCreated} language learning exercises`);

    // Generate new filename with language suffix
    const dir = path.dirname(vttFilePath);
    const baseName = path.basename(vttFilePath, ".vtt");
    const translatedFilePath = path.join(dir, `${baseName}.${targetLanguage}.vtt`);

    // Write translated content to new file
    fs.writeFileSync(translatedFilePath, translatedLines.join("\n"), { encoding: "utf-8" });
    
    log.info(`Successfully translated subtitles to: ${translatedFilePath}`);
    return translatedFilePath;

  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Error translating subtitles in ${vttFilePath}: ${error.message}`);
    } else {
      throw new Error(`Error translating subtitles in ${vttFilePath}: Unknown error`);
    }
  }
}

async function callLibreTranslate(
  text: string,
  sourceLanguage: string,
  targetLanguage: string,
  libretranslateUrl: string
): Promise<string> {
  const requestBody = {
    q: text,
    source: sourceLanguage,
    target: targetLanguage,
    format: "text",
  };

  const response = await fetch(`${libretranslateUrl}/translate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    log.error(`LibreTranslate API error response: ${errorText}`);
    throw new Error(`LibreTranslate API error: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  
  if (!result.translatedText) {
    log.error(`Invalid response structure: ${JSON.stringify(result)}`);
    throw new Error("Invalid response from LibreTranslate API - missing translatedText");
  }

  return result.translatedText;
}

export async function getSupportedLanguages(
  libretranslateUrl = "http://localhost:5000"
): Promise<Array<{ code: string; name: string }>> {
  const response = await fetch(`${libretranslateUrl}/languages`);
  
  if (!response.ok) {
    throw new Error(`LibreTranslate API error: ${response.status} ${response.statusText}`);
  }

  const languages = await response.json();
  
  return languages;
}

export async function detectLanguage(
  text: string,
  libretranslateUrl = "http://localhost:5000"
): Promise<string> {
  try {
    const response = await fetch(`${libretranslateUrl}/detect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: text,
      }),
    });

    if (!response.ok) {
      throw new Error(`LibreTranslate API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result && result.length > 0) {
      return result[0].language;
    }
    
    return "en"; // Default fallback
  } catch (error: unknown) {
    log.error("Language detection failed:", error);
    return "en"; // Default fallback
  }
}