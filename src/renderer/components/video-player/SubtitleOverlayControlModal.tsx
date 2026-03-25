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
  Slider,
  styled,
} from "@mui/material";
import { VideoDataModel } from "../../../models/videoData.model";

interface SubtitleOverlayControlModalProps {
  open: boolean;
  onClose: () => void;
  videoData?: VideoDataModel;
  isEnabled: boolean;
  selectedLanguage: 'en' | 'es' | 'fr' | null;
  fontSize: number;
  onToggleEnabled: (enabled: boolean) => void;
  onLanguageChange: (language: 'en' | 'es' | 'fr' | null) => void;
  onFontSizeChange: (fontSize: number) => void;
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

const StyledSlider = styled(Slider)(({ theme }) => ({
  color: "#1976d2",
  "& .MuiSlider-thumb": {
    backgroundColor: "#1976d2",
  },
  "& .MuiSlider-track": {
    backgroundColor: "#1976d2",
  },
  "& .MuiSlider-rail": {
    backgroundColor: "#444",
  },
  "& .MuiSlider-mark": {
    backgroundColor: "#666",
  },
  "& .MuiSlider-markLabel": {
    color: "#aaa",
    fontSize: "12px",
  },
}));

export const SubtitleOverlayControlModal: React.FC<SubtitleOverlayControlModalProps> = ({
  open,
  onClose,
  videoData,
  isEnabled,
  selectedLanguage,
  fontSize,
  onToggleEnabled,
  onLanguageChange,
  onFontSizeChange,
}) => {
  const [localEnabled, setLocalEnabled] = useState(isEnabled);
  const [localLanguage, setLocalLanguage] = useState<'en' | 'es' | 'fr' | null>(selectedLanguage);
  const [localFontSize, setLocalFontSize] = useState<number>(fontSize);

  useEffect(() => {
    if (open) {
      setLocalEnabled(isEnabled);
      setLocalLanguage(selectedLanguage);
      setLocalFontSize(fontSize);
    }
  }, [open, isEnabled, selectedLanguage, fontSize]);

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
    onFontSizeChange(localFontSize);
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

          {/* Font Size Slider */}
          {localEnabled && (
            <Box>
              <Typography variant="body1" sx={{ color: "white", mb: 2 }}>
                Font Size: {localFontSize}px
              </Typography>
              <StyledSlider
                value={localFontSize}
                onChange={(_, newValue) => setLocalFontSize(newValue as number)}
                min={12}
                max={48}
                step={1}
                marks={[
                  { value: 12, label: '12px' },
                  { value: 18, label: '18px' },
                  { value: 24, label: '24px' },
                  { value: 36, label: '36px' },
                  { value: 48, label: '48px' },
                ]}
                valueLabelDisplay="auto"
                sx={{ mb: 2 }}
              />
              
              {/* Preview */}
              <Box
                sx={{
                  backgroundColor: 'rgba(0,0,0,0.75)',
                  color: 'white',
                  padding: 2,
                  borderRadius: 2,
                  textAlign: 'center',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                }}
              >
                <Typography
                  sx={{
                    fontSize: `${localFontSize}px`,
                    lineHeight: 1.4,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.8)', 
                    color: '#fff',
                  }}
                >
                  This is a preview of subtitle text
                </Typography>
              </Box>
            </Box>
          )}

          {/* Info Text */}
          {availableLanguages.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No subtitle files are available for this video.
            </Typography>
          )}

          {availableLanguages.length > 0 && (
            <Typography variant="body2" sx={
                {
                    color:"#fff"
                }
            }>
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