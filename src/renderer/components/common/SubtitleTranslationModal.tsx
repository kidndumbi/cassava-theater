import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import { VideoDataModel } from "../../../models/videoData.model";
import { useSnackbar } from "../../contexts/SnackbarContext";

interface SubtitleTranslationModalProps {
  open: boolean;
  onClose: () => void;
  videoData: VideoDataModel;
  onTranslationComplete?: (translatedFilePath: string) => void;
}

interface Language {
  code: string;
  name: string;
}

export const SubtitleTranslationModal: React.FC<SubtitleTranslationModalProps> = ({
  open,
  onClose,
  videoData,
  onTranslationComplete,
}) => {
  const { showSnackbar } = useSnackbar();
  const [sourceLanguage, setSourceLanguage] = useState("en");
  const [targetLanguage, setTargetLanguage] = useState("es");
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingLanguages, setLoadingLanguages] = useState(false);

  // Load supported languages on component mount
  useEffect(() => {
    if (open) {
      loadSupportedLanguages();
    }
  }, [open]);

  const loadSupportedLanguages = async () => {
    setLoadingLanguages(true);
    try {
      const supportedLanguages = await window.translationAPI.getSupportedLanguages();
      setLanguages(supportedLanguages);
    } catch (error) {
      console.error("Failed to load supported languages:", error);
      showSnackbar("Failed to load supported languages", "error");
      // Fallback languages
      setLanguages([
        { code: "en", name: "English" },
        { code: "es", name: "Spanish" },
        { code: "fr", name: "French" },
        { code: "de", name: "German" },
        { code: "it", name: "Italian" },
        { code: "pt", name: "Portuguese" },
      ]);
    } finally {
      setLoadingLanguages(false);
    }
  };

  const handleTranslate = async () => {
    if (!videoData.subtitlePath) {
      showSnackbar("No subtitle file found for this video", "error");
      return;
    }

    setLoading(true);
    try {
      const translatedFilePath = await window.translationAPI.translateSubtitles({
        vttFilePath: videoData.subtitlePath,
        targetLanguage,
        sourceLanguage,
      });

      showSnackbar(
        `Subtitles translated successfully to ${languages.find(l => l.code === targetLanguage)?.name || targetLanguage}`,
        "success"
      );
      
      if (onTranslationComplete) {
        onTranslationComplete(translatedFilePath);
      }
      
      onClose();
    } catch (error: any) {
      console.error("Translation failed:", error);
      showSnackbar(
        `Translation failed: ${error.message || "Unknown error"}`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!videoData.subtitlePath) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Translate Subtitles</DialogTitle>
        <DialogContent>
          <Alert severity="warning">
            No subtitle file found for this video. Please add subtitles first before translating.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Translate Subtitles</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Subtitle file: {videoData.subtitlePath}
          </Typography>

          {loadingLanguages ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <CircularProgress size={20} />
              <Typography>Loading languages...</Typography>
            </Box>
          ) : (
            <>
              <FormControl fullWidth>
                <InputLabel>Source Language</InputLabel>
                <Select
                  value={sourceLanguage}
                  label="Source Language"
                  onChange={(e) => setSourceLanguage(e.target.value)}
                  disabled={loading}
                >
                  {languages.map((lang) => (
                    <MenuItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Target Language</InputLabel>
                <Select
                  value={targetLanguage}
                  label="Target Language"
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  disabled={loading}
                >
                  {languages.map((lang) => (
                    <MenuItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </>
          )}

          {loading && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <CircularProgress size={20} />
              <Typography>Translating subtitles...</Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleTranslate} 
          variant="contained" 
          disabled={loading || loadingLanguages || sourceLanguage === targetLanguage}
        >
          Translate
        </Button>
      </DialogActions>
    </Dialog>
  );
};