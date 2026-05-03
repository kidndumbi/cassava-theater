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

interface SubtitleOverlayControlModalProps {
  open: boolean;
  onClose: () => void;
  isEnabled: boolean;
  selectedLanguage: 'en' | 'es' | 'fr' | null;
  fontSize: number;
  hideText: boolean;
  languageLearningEnabled: boolean;
  onToggleEnabled: (enabled: boolean) => void;
  onLanguageChange: (language: 'en' | 'es' | 'fr' | null) => void;
  onFontSizeChange: (fontSize: number) => void;
  onToggleHideText: (hideText: boolean) => void;
  onToggleLanguageLearning: (enabled: boolean) => void;
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
  isEnabled,
  selectedLanguage,
  fontSize,
  hideText,
  languageLearningEnabled,
  onToggleEnabled,
  onLanguageChange,
  onFontSizeChange,
  onToggleHideText,
  onToggleLanguageLearning,
}) => {
  const [localEnabled, setLocalEnabled] = useState(isEnabled);
  const [localLanguage, setLocalLanguage] = useState<'en' | 'es' | 'fr' | null>(selectedLanguage);
  const [localFontSize, setLocalFontSize] = useState<number>(fontSize);
  const [localHideText, setLocalHideText] = useState<boolean>(hideText);
  const [localLanguageLearningEnabled, setLocalLanguageLearningEnabled] = useState<boolean>(languageLearningEnabled);

  useEffect(() => {
    if (open) {
      setLocalEnabled(isEnabled);
      setLocalLanguage(selectedLanguage);
      setLocalFontSize(fontSize);
      setLocalHideText(hideText);
      setLocalLanguageLearningEnabled(languageLearningEnabled);
    }
  }, [open, isEnabled, selectedLanguage, fontSize, hideText, languageLearningEnabled]);

  // All languages are always available for real-time translation
  const availableLanguages = [
    { code: 'en' as const, name: 'English' },
    { code: 'es' as const, name: 'Spanish' },
    { code: 'fr' as const, name: 'French' },
  ];

  // Validation: a language must be selected when overlay is enabled
  const isLanguageSelectionRequired = localEnabled && !localLanguage;
  const canApply = !isLanguageSelectionRequired;

  const handleSave = () => {
    onToggleEnabled(localEnabled);
    onLanguageChange(localEnabled ? localLanguage : null);
    onFontSizeChange(localFontSize);
    onToggleHideText(localHideText);
    onToggleLanguageLearning(localLanguageLearningEnabled);
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
            <StyledFormControl fullWidth>
              <InputLabel>Language</InputLabel>
              <Select
                value={localLanguage || ''}
                onChange={(e) => handleLanguageChange(e.target.value as 'en' | 'es' | 'fr' || null)}
                label="Language"
                error={isLanguageSelectionRequired}
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

          {/* Language Selection Required Warning */}
          {isLanguageSelectionRequired && (
            <Typography variant="body2" sx={{ color: "#f44336", mt: -1 }}>
              Please select a language to enable subtitle overlay.
            </Typography>
          )}

          {/* Hide Text Toggle */}
          {localEnabled && (
            <FormControlLabel
              control={
                <Switch
                  checked={localHideText}
                  onChange={(e) => setLocalHideText(e.target.checked)}
                  color="primary"
                />
              }
              label="Hide subtitle text (show 'Text Hidden' instead)"
              sx={{ "& .MuiFormControlLabel-label": { color: "white" } }}
            />
          )}

          {/* Language Learning Toggle */}
          {localEnabled && (
            <FormControlLabel
              control={
                <Switch
                  checked={localLanguageLearningEnabled}
                  onChange={(e) => setLocalLanguageLearningEnabled(e.target.checked)}
                  color="primary"
                />
              }
              label="Enable Language Learning overlay"
              sx={{ "& .MuiFormControlLabel-label": { color: "white" } }}
            />
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
                    color: localHideText ? 'red' : '#fff',
                  }}
                >
                  {localHideText ? "Text Hidden" : "This is a preview of subtitle text"}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Info Text */}
          <Typography variant="body2" sx={{ color: "#aaa" }}>
            The active video subtitle will be translated in real time to the selected language.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleCancel} color="secondary">
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          color="primary" 
          variant="contained"
          disabled={!canApply}
        >
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SubtitleOverlayControlModal;