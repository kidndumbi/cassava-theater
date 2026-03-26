import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  IconButton,
  styled,
} from "@mui/material";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import DeleteIcon from "@mui/icons-material/Delete";
import { VideoDataModel } from "../../../models/videoData.model";
import { selectFile } from "../../util/helperFunctions";

interface SubtitleLanguagesModalProps {
  open: boolean;
  onClose: () => void;
  videoData: VideoDataModel;
  onSave: (subtitleData: {
    subtitlePath?: string | null;
    subtitlePathEs?: string | null;
    subtitlePathFr?: string | null;
    activeSubtitleLanguage?: 'en' | 'es' | 'fr' | null;
  }) => Promise<void>;
}

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "#444",
    },
    "&:hover fieldset": {
      borderColor: "#666",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#1976d2",
    },
    "& input": {
      color: "white",
    },
  },
  "& .MuiInputLabel-root": {
    color: "#aaa",
    "&.Mui-focused": {
      color: "#1976d2",
    },
  },
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "#444",
    },
    "&:hover fieldset": {
      borderColor: "#666",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#1976d2",
    },
    "& .MuiSelect-select": {
      color: "white",
    },
  },
  "& .MuiInputLabel-root": {
    color: "#aaa",
    "&.Mui-focused": {
      color: "#1976d2",
    },
  },
}));

export const SubtitleLanguagesModal: React.FC<SubtitleLanguagesModalProps> = ({
  open,
  onClose,
  videoData,
  onSave,
}) => {
  const [subtitlePaths, setSubtitlePaths] = useState({
    en: videoData.subtitlePath && videoData.subtitlePath.trim().toLowerCase() !== "none" ? videoData.subtitlePath : "",
    es: videoData.subtitlePathEs && videoData.subtitlePathEs.trim().toLowerCase() !== "none" ? videoData.subtitlePathEs : "",
    fr: videoData.subtitlePathFr && videoData.subtitlePathFr.trim().toLowerCase() !== "none" ? videoData.subtitlePathFr : "",
  });
  
  const [activeLanguage, setActiveLanguage] = useState<'en' | 'es' | 'fr' | null>(
    videoData.activeSubtitleLanguage || null
  );

  useEffect(() => {
    if (open) {
      setSubtitlePaths({
        en: videoData.subtitlePath && videoData.subtitlePath.trim().toLowerCase() !== "none" ? videoData.subtitlePath : "",
        es: videoData.subtitlePathEs && videoData.subtitlePathEs.trim().toLowerCase() !== "none" ? videoData.subtitlePathEs : "",
        fr: videoData.subtitlePathFr && videoData.subtitlePathFr.trim().toLowerCase() !== "none" ? videoData.subtitlePathFr : "",
      });
      setActiveLanguage(videoData.activeSubtitleLanguage || null);
    }
  }, [open, videoData]);

  const handleSelectFile = async (language: 'en' | 'es' | 'fr') => {
    const selectedFilePath = await selectFile();
    if (!selectedFilePath) return;

    const filePath = selectedFilePath.endsWith(".srt")
      ? await window.fileManagerAPI.convertSrtToVtt(selectedFilePath)
      : selectedFilePath;

    setSubtitlePaths(prev => ({
      ...prev,
      [language]: filePath,
    }));
  };

  const handleClearFile = (language: 'en' | 'es' | 'fr') => {
    setSubtitlePaths(prev => ({
      ...prev,
      [language]: "",
    }));
    
    // If clearing the active language, set active to null
    if (activeLanguage === language) {
      setActiveLanguage(null);
    }
  };

  const getAvailableLanguages = () => {
    const available: Array<{ value: 'en' | 'es' | 'fr'; label: string }> = [];
    if (subtitlePaths.en) available.push({ value: 'en', label: 'English' });
    if (subtitlePaths.es) available.push({ value: 'es', label: 'Spanish' });
    if (subtitlePaths.fr) available.push({ value: 'fr', label: 'French' });
    return available;
  };

  const handleSave = async () => {
    const cleanPath = (path: string) => {
      if (!path || path.trim() === "" || path.trim().toLowerCase() === "none") {
        return null;
      }
      return path;
    };

    const subtitleData = {
      subtitlePath: cleanPath(subtitlePaths.en),
      subtitlePathEs: cleanPath(subtitlePaths.es),
      subtitlePathFr: cleanPath(subtitlePaths.fr),
      activeSubtitleLanguage: activeLanguage,
    };

    await onSave(subtitleData);
    onClose();
  };

  const getFileName = (filePath: string) => {
    if (!filePath) return "";
    return filePath.split(/[/\\]/).pop() || "";
  };

  const isActiveLanguageValid = () => {
    if (!activeLanguage) return true; // null is valid (no subtitles)
    return Boolean(subtitlePaths[activeLanguage]);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        style: {
          backgroundColor: "#1a1a1a",
          color: "white",
        },
      }}
    >
      <DialogTitle>
        Manage Subtitle Languages
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 3 }}>
          {/* English Subtitles */}
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: "bold" }}>
              English Subtitles
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <StyledTextField
                fullWidth
                value={getFileName(subtitlePaths.en)}
                placeholder="No file selected"
                InputProps={{ readOnly: true }}
                size="small"
              />
              <IconButton
                onClick={() => handleSelectFile('en')}
                sx={{ color: "#1976d2" }}
                aria-label="Select English subtitle file"
              >
                <FolderOpenIcon />
              </IconButton>
              <IconButton
                onClick={() => handleClearFile('en')}
                sx={{ color: "#f44336" }}
                disabled={!subtitlePaths.en}
                aria-label="Clear English subtitle file"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Spanish Subtitles */}
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: "bold" }}>
              Spanish Subtitles
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <StyledTextField
                fullWidth
                value={getFileName(subtitlePaths.es)}
                placeholder="No file selected"
                InputProps={{ readOnly: true }}
                size="small"
              />
              <IconButton
                onClick={() => handleSelectFile('es')}
                sx={{ color: "#1976d2" }}
                aria-label="Select Spanish subtitle file"
              >
                <FolderOpenIcon />
              </IconButton>
              <IconButton
                onClick={() => handleClearFile('es')}
                sx={{ color: "#f44336" }}
                disabled={!subtitlePaths.es}
                aria-label="Clear Spanish subtitle file"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>

          {/* French Subtitles */}
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: "bold" }}>
              French Subtitles
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <StyledTextField
                fullWidth
                value={getFileName(subtitlePaths.fr)}
                placeholder="No file selected"
                InputProps={{ readOnly: true }}
                size="small"
              />
              <IconButton
                onClick={() => handleSelectFile('fr')}
                sx={{ color: "#1976d2" }}
                aria-label="Select French subtitle file"
              >
                <FolderOpenIcon />
              </IconButton>
              <IconButton
                onClick={() => handleClearFile('fr')}
                sx={{ color: "#f44336" }}
                disabled={!subtitlePaths.fr}
                aria-label="Clear French subtitle file"
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Active Language Selection */}
          <Box sx={{ mt: 2 }}>
            <StyledFormControl fullWidth>
              <InputLabel>Active Subtitle Language</InputLabel>
              <Select
                value={activeLanguage || ""}
                label="Active Subtitle Language"
                onChange={(e) => setActiveLanguage(e.target.value as 'en' | 'es' | 'fr' || null)}
              >
                <MenuItem value="">
                  <em>None (No subtitles)</em>
                </MenuItem>
                {getAvailableLanguages().map((lang) => (
                  <MenuItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </MenuItem>
                ))}
              </Select>
            </StyledFormControl>
            {!isActiveLanguageValid() && (
              <Typography color="error" variant="caption" sx={{ mt: 1, display: "block" }}>
                The selected active language does not have a subtitle file. Please select a file or choose a different language.
              </Typography>
            )}
          </Box>

          <Typography variant="body2" sx={{ color: "#aaa", mt: 2 }}>
            Set subtitle files for different languages and choose which one should be active during playback.
            Only languages with subtitle files can be selected as active.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button 
          onClick={onClose}
          sx={{ color: "#aaa" }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!isActiveLanguageValid()}
          sx={{
            backgroundColor: "#1976d2",
            "&:hover": {
              backgroundColor: "#1565c0",
            },
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};