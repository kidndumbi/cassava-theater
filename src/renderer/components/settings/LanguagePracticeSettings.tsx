import React, { useRef, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { Stop as StopIcon, PlayArrow as PlayIcon } from "@mui/icons-material";
import { useOllamaModels } from "../../hooks/useOllamaModels";

type Language = "en" | "es" | "fr";
type Length = "low" | "medium" | "high";
type TranslationEngine = "libretranslate" | string;

const LANG_NAMES: Record<Language, string> = {
  en: "English",
  es: "Spanish",
  fr: "French",
};

const LENGTH_INSTRUCTIONS: Record<Length, string> = {
  low: "It should be short and simple — around 4 to 6 words.",
  medium: "It should be conversational and moderately complex — around 7 to 9 words.",
  high: "It should be detailed and complex — around 10 to 12 words.",
};

interface Progress {
  current: number;
  total: number;
  saved: number;
  skipped: number;
  errors: number;
}

export const LanguagePracticeSettings: React.FC = () => {
  const theme = useTheme();
  const { data: ollamaModels = [] } = useOllamaModels();

  const [nativeLanguage, setNativeLanguage] = useState<Language>("en");
  const [practiceLanguage, setPracticeLanguage] = useState<Language>("es");
  const [length, setLength] = useState<Length>("medium");
  const [count, setCount] = useState(10);
  const [selectedModel, setSelectedModel] = useState("");
  const [translationEngine, setTranslationEngine] = useState<TranslationEngine>("libretranslate");
  const [libretranslateUrl, setLibretranslateUrl] = useState("http://localhost:5000");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<Progress | null>(null);

  const shouldStopRef = useRef(false);

  const effectiveModel = selectedModel || ollamaModels[0]?.name || "";

  const generatePhrase = async (langName: string, lengthInstruction: string): Promise<string> => {
    const prompt =
      `Generate a single, natural ${langName} sentence suitable for a language learning exercise. ` +
      `${lengthInstruction} ` +
      `Return only the sentence itself — no explanation, no quotes, no extra text.`;
    return window.llmAPI.generateLlmResponse(prompt, effectiveModel || undefined);
  };

  const translatePhrase = async (text: string, source: Language, target: Language): Promise<string> => {
    if (translationEngine === "libretranslate") {
      return window.translationAPI.translateText({
        text,
        sourceLanguage: source,
        targetLanguage: target,
        libretranslateUrl,
      });
    }
    // Use LLM for translation
    const langNames: Record<Language, string> = { en: "English", es: "Spanish", fr: "French" };
    const prompt =
      `Translate the following ${langNames[source]} sentence into ${langNames[target]}. ` +
      `Return only the translated sentence — no explanation, no quotes, no extra text.\n\n"${text}"`;
    return window.llmAPI.generateLlmResponse(prompt, translationEngine);
  };

  const startGeneration = async () => {
    if (!effectiveModel) {
      alert("No Ollama model available. Ensure Ollama is running and a model is installed.");
      return;
    }
    if (nativeLanguage === practiceLanguage) {
      alert("Native and practice languages must be different.");
      return;
    }

    shouldStopRef.current = false;
    setIsGenerating(true);
    const prog: Progress = { current: 0, total: count, saved: 0, skipped: 0, errors: 0 };
    setProgress({ ...prog });

    const langName = LANG_NAMES[nativeLanguage];
    const lengthInstruction = LENGTH_INSTRUCTIONS[length];

    // Load existing texts to detect duplicates
    const existingTexts = new Set<string>();
    try {
      const allResp = await window.languageLearningAPI.getAllExercises();
      if (allResp.success && allResp.data) {
        for (const ex of allResp.data) {
          if (ex.practiceLanguageText) existingTexts.add(ex.practiceLanguageText.trim().toLowerCase());
        }
      }
    } catch {
      // Proceed without duplicate detection if it fails
    }

    const translationTag =
      translationEngine === "libretranslate"
        ? "translated-by-libretranslate"
        : `translated-by-${translationEngine}`;

    try {
      for (let i = 0; i < count; i++) {
        if (shouldStopRef.current) break;

        try {
          const nativeText = await generatePhrase(langName, lengthInstruction);
          if (!nativeText || shouldStopRef.current) {
            prog.errors++;
            prog.current++;
            setProgress({ ...prog });
            continue;
          }

          let practiceText: string | undefined;
          try {
            practiceText = await translatePhrase(nativeText, nativeLanguage, practiceLanguage);
          } catch {
            prog.errors++;
            prog.current++;
            setProgress({ ...prog });
            continue;
          }

          if (!practiceText) {
            prog.errors++;
            prog.current++;
            setProgress({ ...prog });
            continue;
          }

          // Duplicate check
          if (existingTexts.has(practiceText.trim().toLowerCase())) {
            prog.skipped++;
            prog.current++;
            setProgress({ ...prog });
            continue;
          }

          const wordCount = practiceText.trim().split(/\s+/).filter((w) => w.length > 0).length;
          const exercise: Partial<import("../../../models/language-learning-exercise.model").LanguageLearningExerciseModel> = {
            nativeLanguageText: nativeText.trim(),
            practiceLanguageText: practiceText.trim(),
            nativeLanguage,
            practiceLanguage,
            wordCount,
            videoFileName: "Bulk Generation",
            videoFilePath: "bulk-generation",
            startTime: 0,
            endTime: 1,
            duration: 1,
            createdAt: Date.now(),
            practiceCount: 0,
            accuracyRate: 0,
            tags: ["auto-generated", translationTag],
          };

          const resp = await window.languageLearningAPI.saveExercise(exercise);
          if (resp.success) {
            existingTexts.add(practiceText.trim().toLowerCase());
            prog.saved++;
          } else {
            prog.errors++;
          }
        } catch {
          prog.errors++;
        }

        prog.current++;
        setProgress({ ...prog });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const cardBg = theme.customVariables?.appDark;

  return (
    <Card style={{ marginTop: "20px", backgroundColor: cardBg }}>
      <CardHeader
        title={
          <Typography variant="h6" style={{ color: theme.customVariables?.appWhiteSmoke }}>
            Bulk Exercise Generation
          </Typography>
        }
      />
      <CardContent>
        <Box className="flex flex-col gap-4">
          {/* Language Selection */}
          <Box className="flex gap-4">
            <FormControl fullWidth size="small">
              <InputLabel>Native Language</InputLabel>
              <Select
                value={nativeLanguage}
                label="Native Language"
                onChange={(e) => setNativeLanguage(e.target.value as Language)}
                disabled={isGenerating}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="es">Spanish</MenuItem>
                <MenuItem value="fr">French</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel>Practice Language</InputLabel>
              <Select
                value={practiceLanguage}
                label="Practice Language"
                onChange={(e) => setPracticeLanguage(e.target.value as Language)}
                disabled={isGenerating}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="es">Spanish</MenuItem>
                <MenuItem value="fr">French</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Sentence Length */}
          <FormControl fullWidth size="small">
            <InputLabel>Sentence Length</InputLabel>
            <Select
              value={length}
              label="Sentence Length"
              onChange={(e) => setLength(e.target.value as Length)}
              disabled={isGenerating}
            >
              <MenuItem value="low">Short (4–6 words)</MenuItem>
              <MenuItem value="medium">Medium (7–9 words)</MenuItem>
              <MenuItem value="high">Long (10–12 words)</MenuItem>
            </Select>
          </FormControl>

          {/* Count */}
          <TextField
            label="Number of Exercises (1–1000)"
            type="number"
            size="small"
            value={count}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (v >= 1 && v <= 1000) setCount(v);
            }}
            disabled={isGenerating}
            inputProps={{ min: 1, max: 1000 }}
          />

          {/* Ollama Model */}
          <FormControl fullWidth size="small">
            <InputLabel>Ollama Model (for phrase generation)</InputLabel>
            <Select
              value={selectedModel || (ollamaModels[0]?.name ?? "")}
              label="Ollama Model (for phrase generation)"
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={isGenerating}
            >
              {ollamaModels.map((m) => (
                <MenuItem key={m.model} value={m.name}>
                  {m.name}
                </MenuItem>
              ))}
              {ollamaModels.length === 0 && (
                <MenuItem value="" disabled>
                  No models found
                </MenuItem>
              )}
            </Select>
          </FormControl>

          {/* Translation Engine */}
          <FormControl fullWidth size="small">
            <InputLabel>Translation Engine</InputLabel>
            <Select
              value={translationEngine}
              label="Translation Engine"
              onChange={(e) => setTranslationEngine(e.target.value)}
              disabled={isGenerating}
            >
              <MenuItem value="libretranslate">LibreTranslate</MenuItem>
              {ollamaModels.map((m) => (
                <MenuItem key={m.model} value={m.name}>
                  {m.name} (LLM)
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* LibreTranslate URL (only when libretranslate selected) */}
          {translationEngine === "libretranslate" && (
            <TextField
              label="LibreTranslate URL"
              size="small"
              value={libretranslateUrl}
              onChange={(e) => setLibretranslateUrl(e.target.value)}
              disabled={isGenerating}
              placeholder="http://localhost:5000"
            />
          )}

          {/* Progress */}
          {progress && (
            <Box>
              <Typography variant="body2" gutterBottom>
                {isGenerating
                  ? `Generating ${progress.current} / ${progress.total}...`
                  : `Done: ${progress.current} / ${progress.total}`}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={progress.total > 0 ? (progress.current / progress.total) * 100 : 0}
                sx={{ mb: 1 }}
              />
              <Typography variant="caption" color="text.secondary">
                {progress.saved} saved &nbsp;·&nbsp; {progress.skipped} duplicates skipped &nbsp;·&nbsp;{" "}
                {progress.errors} errors
              </Typography>
            </Box>
          )}

          {/* Buttons */}
          {!isGenerating ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={<PlayIcon />}
              onClick={startGeneration}
              disabled={ollamaModels.length === 0}
            >
              Generate
            </Button>
          ) : (
            <Button
              variant="contained"
              color="error"
              startIcon={<StopIcon />}
              onClick={() => { shouldStopRef.current = true; }}
            >
              Stop
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
