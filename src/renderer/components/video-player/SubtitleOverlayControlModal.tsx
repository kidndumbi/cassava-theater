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
  Switch,
  FormControlLabel,
  Typography,
  Box,
  styled,
} from "@mui/material";
import { VideoDataModel } from "../../../models/videoData.model";

interface SubtitleOverlayControlModalProps {
  open: boolean;
  onClose: () => void;
  videoData?: VideoDataModel;
  isEnabled: boolean;
  selectedLanguage: 'en' | 'es' | 'fr' | null;
  selectedSize: 'small' | 'medium' | 'large';
  onToggleEnabled: (enabled: boolean) => void;
  onLanguageChange: (language: 'en' | 'es' | 'fr' | null) => void;
  onSizeChange: (size: 'small' | 'medium' | 'large') => void;
}

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

export const SubtitleOverlayControlModal: React.FC<SubtitleOverlayControlModalProps> = ({
  open,
  onClose,
  videoData,
  isEnabled,
  selectedLanguage,
  selectedSize,
  onToggleEnabled,
  onLanguageChange,
  onSizeChange,
}) => {
  const [localEnabled, setLocalEnabled] = useState(isEnabled);
  const [localLanguage, setLocalLanguage] = useState<'en' | 'es' | 'fr' | null>(selectedLanguage);
  const [localSize, setLocalSize] = useState<'small' | 'medium' | 'large'>(selectedSize);

  useEffect(() => {
    if (open) {
      setLocalEnabled(isEnabled);
      setLocalLanguage(selectedLanguage);
      setLocalSize(selectedSize);
    }
  }, [open, isEnabled, selectedLanguage, selectedSize]);

  // Get available languages based on subtitle paths
  const getAvailableLanguages = () => {
    if (!videoData) return [];

    const languages = [];
    
    if (videoData.subtitlePath) {
      languages.push({ code: 'en' as const, name: 'English', path: videoData.subtitlePath });
    }
    if (videoData.subtitlePathEs) {
      languages.push({ code: 'es' as const, name: 'Spanish', path: videoData.subtitlePathEs });
    }
    if (videoData.subtitlePathFr) {
      languages.push({ code: 'fr' as const, name: 'French', path: videoData.subtitlePathFr });
    }

    return languages;
  };

  const availableLanguages = getAvailableLanguages();

  const handleSave = () => {
    onToggleEnabled(localEnabled);
    onLanguageChange(localEnabled ? localLanguage : null);
    onSizeChange(localSize);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const handleLanguageChange = (language: 'en' | 'es' | 'fr' | null) => {
    setLocalLanguage(language);
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          backgroundColor: "#1a1a1a",
          color: "white",
        },
      }}
    >
      <DialogTitle>
        <Typography variant="h6" component="div">
          Subtitle Overlay Controls
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
          {/* Enable/Disable Toggle */}
          <FormControlLabel
            control={
              <Switch
                checked={localEnabled}
                onChange={(e) => setLocalEnabled(e.target.checked)}
                color="primary"
              />
            }
            label="Enable Custom Subtitle Overlay"
            sx={{ "& .MuiFormControlLabel-label": { color: "white" } }}
          />

          {/* Language Selection */}
          {localEnabled && (
            <StyledFormControl fullWidth disabled={availableLanguages.length === 0}>
              <InputLabel>Language</InputLabel>
              <Select
                value={localLanguage || ''}
                onChange={(e) => handleLanguageChange(e.target.value as 'en' | 'es' | 'fr' || null)}
                label="Language"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {availableLanguages.map((lang) => (
                  <MenuItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </MenuItem>
                ))}
              </Select>
            </StyledFormControl>
          )}

          {/* Text Size Selection */}
          {localEnabled && (
            <StyledFormControl fullWidth>
              <InputLabel>Text Size</InputLabel>
              <Select
                value={localSize}
                onChange={(e) => setLocalSize(e.target.value as 'small' | 'medium' | 'large')}
                label="Text Size"
              >
                <MenuItem value="small">Small (14px)</MenuItem>
                <MenuItem value="medium">Medium (16px)</MenuItem>
                <MenuItem value="large">Large (18px)</MenuItem>
              </Select>
            </StyledFormControl>
          )}

          {/* Info Text */}
          {availableLanguages.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No subtitle files are available for this video.
            </Typography>
          )}

          {availableLanguages.length > 0 && (
            <Typography variant="body2" color="text.secondary">
              Available languages: {availableLanguages.map(lang => lang.name).join(', ')}
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleCancel} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary" variant="contained">
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SubtitleOverlayControlModal;