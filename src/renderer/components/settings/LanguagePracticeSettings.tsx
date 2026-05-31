import React, { useRef, useState } from "react";
import OpenAI from "openai";
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
  InputAdornment,
  IconButton,
  Chip,
} from "@mui/material";
import { Stop as StopIcon, PlayArrow as PlayIcon, Save, Visibility, VisibilityOff } from "@mui/icons-material";
import { useOllamaModels } from "../../hooks/useOllamaModels";
import { useGetAllSettings } from "../../hooks/settings/useGetAllSettings";
import { useSetSetting } from "../../hooks/settings/useSetSetting";

type Language = "en" | "es" | "fr";
type Length = "low" | "medium" | "high";

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
  const { data: settings } = useGetAllSettings();
  const { mutateAsync: setSetting } = useSetSetting();

  const subtitleEngine = settings?.subtitleOverlay?.translationEngine ?? '';
  const subtitleLibretranslateUrl = settings?.subtitleOverlay?.libretranslateUrl ?? 'http://localhost:5000';
  const [pendingSubtitleUrl, setPendingSubtitleUrl] = useState<string | null>(null);
  const displayedSubtitleUrl = pendingSubtitleUrl ?? subtitleLibretranslateUrl;

  const saveSubtitleEngine = (engine: string) => {
    setSetting({
      key: 'subtitleOverlay',
      value: { ...(settings?.subtitleOverlay ?? { fontSize: 16 }), translationEngine: engine },
    });
  };

  const saveSubtitleLibretranslateUrl = () => {
    const url = pendingSubtitleUrl ?? subtitleLibretranslateUrl;
    setSetting({
      key: 'subtitleOverlay',
      value: { ...(settings?.subtitleOverlay ?? { fontSize: 16 }), libretranslateUrl: url },
    });
    setPendingSubtitleUrl(null);
  };

  const [nativeLanguage, setNativeLanguage] = useState<Language>("en");
  const [practiceLanguage, setPracticeLanguage] = useState<Language>("es");
  const [length, setLength] = useState<Length>("medium");
  const [count, setCount] = useState(10);
  const [libretranslateUrl, setLibretranslateUrl] = useState("http://localhost:5000");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<Progress | null>(null);

  // Persisted model/engine selections — default to deepseek (mirrors cas-lang behaviour)
  const savedBulkModel = settings?.bulkGenerationModel ?? "deepseek";
  const savedBulkEngine = settings?.bulkTranslationEngine ?? "deepseek";

  const saveBulkModel = (model: string) => setSetting({ key: "bulkGenerationModel", value: model });
  const saveBulkEngine = (engine: string) => setSetting({ key: "bulkTranslationEngine", value: engine });

  const selectedModel = savedBulkModel;
  const translationEngine = savedBulkEngine;

  // DeepSeek API key
  const savedDeepseekKey = settings?.deepseekApiKey ?? "";
  const [pendingDeepseekKey, setPendingDeepseekKey] = useState<string | null>(null);
  const displayedDeepseekKey = pendingDeepseekKey ?? savedDeepseekKey;
  const [showDeepseekKey, setShowDeepseekKey] = useState(false);
  const [deepseekTestStatus, setDeepseekTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [deepseekTestMessage, setDeepseekTestMessage] = useState("");

  const saveDeepseekApiKey = () => {
    const key = pendingDeepseekKey ?? savedDeepseekKey;
    setSetting({ key: "deepseekApiKey", value: key });
    setPendingDeepseekKey(null);
    setDeepseekTestStatus("idle");
    setDeepseekTestMessage("");
  };

  const testDeepseekApiKey = async () => {
    const key = displayedDeepseekKey.trim();
    if (!key) {
      setDeepseekTestStatus("error");
      setDeepseekTestMessage("API key is empty.");
      return;
    }
    setDeepseekTestStatus("testing");
    setDeepseekTestMessage("");
    try {
      const client = new OpenAI({ apiKey: key, baseURL: "https://api.deepseek.com", dangerouslyAllowBrowser: true });
      await client.chat.completions.create({
        model: "deepseek-chat",
        messages: [{ role: "user", content: "Hi" }],
        max_tokens: 5,
        stream: false,
      });
      setDeepseekTestStatus("success");
      setDeepseekTestMessage("API key is valid and working.");
    } catch (err) {
      setDeepseekTestStatus("error");
      setDeepseekTestMessage(err instanceof Error ? `Failed: ${err.message}` : "Connection failed.");
    }
  };

  const generateWithDeepseek = async (prompt: string): Promise<string> => {
    const key = (settings?.deepseekApiKey ?? "").trim();
    if (!key) throw new Error("No DeepSeek API key configured. Save your key in the DeepSeek API Key section below.");
    const client = new OpenAI({ apiKey: key, baseURL: "https://api.deepseek.com", dangerouslyAllowBrowser: true });
    const res = await client.chat.completions.create({
      model: "deepseek-chat",
      messages: [{ role: "user", content: prompt }],
      stream: false,
    });
    return res.choices[0]?.message?.content?.trim() ?? "";
  };

  const shouldStopRef = useRef(false);

  const effectiveModel = selectedModel || ollamaModels[0]?.name || "";

  const generatePhrase = async (langName: string, lengthInstruction: string): Promise<string> => {
    const prompt =
      `Generate a single, natural ${langName} sentence suitable for a language learning exercise. ` +
      `${lengthInstruction} ` +
      `Return only the sentence itself — no explanation, no quotes, no extra text.`;
    if (effectiveModel === "deepseek") return generateWithDeepseek(prompt);
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
    const langNames: Record<Language, string> = { en: "English", es: "Spanish", fr: "French" };
    const prompt =
      `Translate the following ${langNames[source]} sentence into ${langNames[target]}. ` +
      `Return only the translated sentence — no explanation, no quotes, no extra text.\n\n"${text}"`;
    if (translationEngine === "deepseek") return generateWithDeepseek(prompt);
    return window.llmAPI.generateLlmResponse(prompt, translationEngine);
  };

  const startGeneration = async () => {
    if (effectiveModel !== "deepseek" && !effectiveModel) {
      alert("No Ollama model available. Ensure Ollama is running and a model is installed.");
      return;
    }
    if (effectiveModel === "deepseek" && !(settings?.deepseekApiKey ?? "").trim()) {
      alert("DeepSeek API key is not configured. Please save your API key in the DeepSeek API Key section below.");
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
    <>
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
            label="Number of Exercises (1–10000)"
            type="number"
            size="small"
            value={count}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (v >= 1 && v <= 10000) setCount(v);
            }}
            disabled={isGenerating}
            inputProps={{ min: 1, max: 10000 }}
          />

          {/* Generation Model */}
          <FormControl fullWidth size="small">
            <InputLabel>Generation Model</InputLabel>
            <Select
              value={selectedModel || (ollamaModels[0]?.name ?? "")}
              label="Generation Model"
              onChange={(e) => saveBulkModel(e.target.value)}
              disabled={isGenerating}
            >
              <MenuItem value="deepseek">DeepSeek (API)</MenuItem>
              {ollamaModels.map((m) => (
                <MenuItem key={m.model} value={m.name}>
                  {m.name} (Ollama)
                </MenuItem>
              ))}
              {ollamaModels.length === 0 && (
                <MenuItem value="" disabled>
                  No Ollama models found
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
              onChange={(e) => saveBulkEngine(e.target.value)}
              disabled={isGenerating}
            >
              <MenuItem value="libretranslate">LibreTranslate</MenuItem>
              <MenuItem value="deepseek">DeepSeek (API)</MenuItem>
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
              disabled={effectiveModel !== "deepseek" && ollamaModels.length === 0}
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

    {/* DeepSeek API Key */}
    <Card style={{ marginTop: "20px", backgroundColor: cardBg }}>
      <CardHeader
        title={
          <Typography variant="h6" style={{ color: theme.customVariables?.appWhiteSmoke }}>
            DeepSeek API Key
          </Typography>
        }
        subheader={
          <Typography variant="body2" style={{ color: theme.customVariables?.appWhiteSmoke, opacity: 0.7 }}>
            Required when using DeepSeek as the generation model or translation engine
          </Typography>
        }
      />
      <CardContent>
        <Box className="flex flex-col gap-4">
          <Box style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <TextField
              label="DeepSeek API Key"
              size="small"
              fullWidth
              type={showDeepseekKey ? "text" : "password"}
              value={displayedDeepseekKey}
              onChange={(e) => setPendingDeepseekKey(e.target.value)}
              placeholder="sk-..."
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowDeepseekKey((v) => !v)} edge="end">
                      {showDeepseekKey ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              sx={{ flexShrink: 0 }}
              variant="contained"
              color="primary"
              onClick={saveDeepseekApiKey}
              disabled={pendingDeepseekKey === null}
            >
              <Save />
            </Button>
          </Box>
          <Box style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Button
              variant="outlined"
              size="small"
              onClick={testDeepseekApiKey}
              disabled={deepseekTestStatus === "testing" || !displayedDeepseekKey.trim()}
            >
              {deepseekTestStatus === "testing" ? "Testing…" : "Test Key"}
            </Button>
            {deepseekTestStatus === "success" && (
              <Chip label={deepseekTestMessage} color="success" size="small" />
            )}
            {deepseekTestStatus === "error" && (
              <Chip label={deepseekTestMessage} color="error" size="small" />
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>

    {/* Subtitle Translation Engine */}
    <Card style={{ marginTop: "20px", backgroundColor: cardBg }}>
      <CardHeader
        title={
          <Typography variant="h6" style={{ color: theme.customVariables?.appWhiteSmoke }}>
            Subtitle Translation Engine
          </Typography>
        }
        subheader={
          <Typography variant="body2" style={{ color: theme.customVariables?.appWhiteSmoke, opacity: 0.7 }}>
            Which engine to use when translating subtitles in the Language Learning overlay
          </Typography>
        }
      />
      <CardContent>
        <Box className="flex flex-col gap-4">
          <FormControl fullWidth size="small">
            <InputLabel>Translation Engine</InputLabel>
            <Select
              value={subtitleEngine}
              label="Translation Engine"
              onChange={(e) => saveSubtitleEngine(e.target.value)}
              displayEmpty
            >
              <MenuItem value="libretranslate">LibreTranslate</MenuItem>
              <MenuItem value="deepseek">DeepSeek (API)</MenuItem>
              {ollamaModels.map((m) => (
                <MenuItem key={m.model} value={m.name}>
                  {m.name} (LLM)
                </MenuItem>
              ))}
              {ollamaModels.length === 0 && (
                <MenuItem value="" disabled>
                  No LLM models found — install Ollama models first
                </MenuItem>
              )}
            </Select>
          </FormControl>

          {subtitleEngine === 'libretranslate' && (
            <Box style={{ display: 'flex', alignItems: 'center' }}>
              <TextField
                label="LibreTranslate URL"
                size="small"
                fullWidth
                value={displayedSubtitleUrl}
                onChange={(e) => setPendingSubtitleUrl(e.target.value)}
                placeholder="http://localhost:5000"
              />
              <Button
                sx={{ marginLeft: '8px', flexShrink: 0 }}
                variant="contained"
                color="primary"
                onClick={saveSubtitleLibretranslateUrl}
              >
                <Save />
              </Button>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
    </>
  );
};
