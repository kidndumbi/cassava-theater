import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Chip } from "@mui/material";
import { LanguageLearningExerciseModel } from "../../../models/language-learning-exercise.model";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  exercise: LanguageLearningExerciseModel | null;
}

export const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  exercise,
}) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
    >
      <DialogTitle>Delete Exercise</DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Are you sure you want to delete this exercise?
        </Typography>
        {exercise && (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
              {exercise.practiceLanguageText}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Translation: {exercise.nativeLanguageText}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip 
                label={`${exercise.practiceLanguage.toUpperCase()} → ${exercise.nativeLanguage.toUpperCase()}`}
                size="small"
                color="primary"
              />
              {exercise.difficulty && (
                <Chip label={exercise.difficulty} size="small" variant="outlined" />
              )}
              {exercise.practiceCount && (
                <Chip label={`${exercise.practiceCount} practices`} size="small" variant="outlined" />
              )}
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};