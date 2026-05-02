import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
} from "@mui/material";
import {
  Delete,
  Add as AddIcon,
  LocalOffer as LocalOfferIcon,
  History as HistoryIcon,
} from "@mui/icons-material";
import { LanguageLearningExerciseModel } from "../../../models/language-learning-exercise.model";

interface EditExerciseDialogForm {
  practiceLanguageText: string;
  nativeLanguageText: string;
  practiceLanguage: "en" | "es" | "fr" | "";
  nativeLanguage: "en" | "es" | "fr" | "";
  difficulty: "easy" | "medium" | "hard" | "";
}

interface EditExerciseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onDelete: () => void;
  exercise: LanguageLearningExerciseModel | null;
  form: EditExerciseDialogForm;
  onFormChange: <K extends keyof EditExerciseDialogForm>(
    field: K,
    value: EditExerciseDialogForm[K],
  ) => void;
  tags: string[];
  newTag: string;
  onTagsChange: (tags: string[]) => void;
  onNewTagChange: (tag: string) => void;
  allTags: string[];
  isUpdating: boolean;
  onViewLogs?: () => void;
}

export const EditExerciseDialog: React.FC<EditExerciseDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onDelete,
  exercise,
  form,
  onFormChange,
  tags,
  newTag,
  onTagsChange,
  onNewTagChange,
  allTags,
  isUpdating,
  onViewLogs,
}) => {
  const addTag = () => {
    const tagName = newTag.trim().toLowerCase();
    if (tagName && !tags.includes(tagName)) {
      onTagsChange([...tags, tagName]);
      onNewTagChange("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const addExistingTag = (tag: string) => {
    if (!tags.includes(tag)) {
      onTagsChange([...tags, tag]);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Exercise</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 2 }}>
          <TextField
            label="Native Language Text (Reference)"
            multiline
            rows={3}
            value={form.nativeLanguageText}
            onChange={(e) => onFormChange("nativeLanguageText", e.target.value)}
            fullWidth
            helperText="The reference text shown to help users"
          />
          <TextField
            label="Practice Language Text"
            multiline
            rows={3}
            value={form.practiceLanguageText}
            onChange={(e) =>
              onFormChange("practiceLanguageText", e.target.value)
            }
            fullWidth
            helperText="The text that users will practice arranging"
          />

          <Button
            onClick={() => {
              if (
                form.nativeLanguage &&
                form.nativeLanguageText.trim() &&
                form.practiceLanguage &&
                form.nativeLanguage
              ) {
                window.translationAPI
                  .translateText({
                    text: form.nativeLanguageText.trim(),
                    sourceLanguage: form.nativeLanguage,
                    targetLanguage: form.practiceLanguage,
                  })
                  .then((translatedText) => {
                    onFormChange("practiceLanguageText", translatedText);
                  })
                  .catch((error: any) => {
                    console.error("Translation error:", error);
                    alert("Failed to translate text. Please try again.");
                  });
              } else {
                alert(
                  "Please fill in the native language text, select both practice and native languages before translating.",
                );
              }
            }}
            color="primary"
          >
            Translate
          </Button>

          <Box sx={{ display: "flex", gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Native Language</InputLabel>
              <Select
                value={form.nativeLanguage}
                label="Native Language"
                onChange={(e) =>
                  onFormChange(
                    "nativeLanguage",
                    e.target.value as "en" | "es" | "fr" | "",
                  )
                }
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="es">Spanish</MenuItem>
                <MenuItem value="fr">French</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Practice Language</InputLabel>
              <Select
                value={form.practiceLanguage}
                label="Practice Language"
                onChange={(e) =>
                  onFormChange(
                    "practiceLanguage",
                    e.target.value as "en" | "es" | "fr" | "",
                  )
                }
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="es">Spanish</MenuItem>
                <MenuItem value="fr">French</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <FormControl fullWidth>
            <InputLabel>Difficulty</InputLabel>
            <Select
              value={form.difficulty}
              label="Difficulty"
              onChange={(e) =>
                onFormChange(
                  "difficulty",
                  e.target.value as "easy" | "medium" | "hard" | "",
                )
              }
            >
              <MenuItem value="">Not Set</MenuItem>
              <MenuItem value="easy">Easy</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="hard">Hard</MenuItem>
            </Select>
          </FormControl>

          {/* Tags Management */}
          <Box>
            <Typography
              variant="h6"
              sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}
            >
              <LocalOfferIcon /> Exercise Tags
            </Typography>

            {/* Current Tags */}
            {tags.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Current Tags:
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onDelete={() => removeTag(tag)}
                      deleteIcon={<Delete />}
                      variant="outlined"
                      color="primary"
                      sx={{
                        "& .MuiChip-deleteIcon": {
                          color: "error.main",
                          "&:hover": {
                            color: "error.dark",
                          },
                        },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

            {/* Add New Tag */}
            <Box
              sx={{ display: "flex", gap: 2, alignItems: "flex-start", mb: 2 }}
            >
              <TextField
                label="Add Tag"
                value={newTag}
                onChange={(e) => onNewTagChange(e.target.value)}
                placeholder="Enter tag name..."
                size="small"
                fullWidth
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    addTag();
                  }
                }}
              />
              <Button
                onClick={addTag}
                disabled={
                  !newTag.trim() || tags.includes(newTag.trim().toLowerCase())
                }
                variant="outlined"
                startIcon={<AddIcon />}
                sx={{ minWidth: 100 }}
              >
                Add
              </Button>
            </Box>

            {/* Existing Tags - Quick Add */}
            {allTags.length > 0 && (
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Quick Add from Existing Tags:
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1,
                    maxHeight: 120,
                    overflowY: "auto",
                    p: 1,
                    bgcolor: "grey.50",
                    borderRadius: 1,
                  }}
                >
                  {allTags
                    .filter((tag) => !tags.includes(tag))
                    .map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        onClick={() => addExistingTag(tag)}
                        variant="outlined"
                        color="default"
                        sx={{
                          cursor: "pointer",
                          "&:hover": {
                            bgcolor: "primary.light",
                            color: "white",
                          },
                        }}
                      />
                    ))}
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={onDelete}
          color="error"
          startIcon={<Delete />}
          sx={{ mr: "auto" }}
        >
          Delete
        </Button>
        {onViewLogs && (
          <Button
            onClick={onViewLogs}
            color="inherit"
            startIcon={<HistoryIcon />}
          >
            View Logs
          </Button>
        )}
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button
          onClick={onSubmit}
          color="primary"
          variant="contained"
          disabled={
            isUpdating ||
            !form.practiceLanguageText.trim() ||
            !form.nativeLanguageText.trim()
          }
        >
          {isUpdating ? "Updating..." : "Update Exercise"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
