import { loggingService as log } from "./main-logging.service";
import * as path from "path";
import * as fs from "fs";

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

    // Read the VTT file content
    const vttContent = fs.readFileSync(vttFilePath, { encoding: "utf-8" });
    const lines = vttContent.split("\n");

    // Parse VTT structure
    const translatedLines: string[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Keep WEBVTT header
      if (line === "WEBVTT" || line === "" || /^\d+$/.test(line.trim())) {
        translatedLines.push(line);
        i++;
        continue;
      }

      // Keep timestamp lines
      if (/^\d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}:\d{2}\.\d{3}$/.test(line)) {
        translatedLines.push(line);
        i++;

        // Collect all subtitle text lines for this subtitle block
        const textLines: string[] = [];
        while (i < lines.length && lines[i].trim() !== "" && !/^\d+$/.test(lines[i].trim()) && !/^\d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}:\d{2}\.\d{3}$/.test(lines[i])) {
          textLines.push(lines[i]);
          i++;
        }

        // Translate the text if it exists
        if (textLines.length > 0) {
          const textToTranslate = textLines.join(" ").trim();
          
          if (textToTranslate) {
            try {
              const translatedText = await callLibreTranslate(textToTranslate, sourceLanguage, targetLanguage, libretranslateUrl);
              
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
  const response = await fetch(`${libretranslateUrl}/translate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      q: text,
      source: sourceLanguage,
      target: targetLanguage,
      format: "text",
    }),
  });

  if (!response.ok) {
    throw new Error(`LibreTranslate API error: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  
  if (!result.translatedText) {
    throw new Error("Invalid response from LibreTranslate API");
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