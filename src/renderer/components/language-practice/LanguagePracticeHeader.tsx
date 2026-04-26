import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { School, List as ListIcon, LocalOffer as LocalOfferIcon, AddCircle as AddCircleIcon } from "@mui/icons-material";

interface LanguagePracticeHeaderProps {
  totalExercises: number;
  onOpenExercisesList: () => void;
  onOpenTagModal: () => void;
  onCreateExercise: () => void;
}

export const LanguagePracticeHeader: React.FC<LanguagePracticeHeaderProps> = ({
  totalExercises,
  onOpenExercisesList,
  onOpenTagModal,
  onCreateExercise,
}) => {
  return (
    <Box sx={{ textAlign: "center", mb: 4 }}>
      <School sx={{ fontSize: 60, mb: 2, color: "primary.main" }} />
      <Typography variant="h4" component="h1" gutterBottom>
        Language Practice
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Total exercises available: {totalExercises}
      </Typography>
      <Button
        variant="outlined"
        startIcon={<ListIcon />}
        onClick={onOpenExercisesList}
        sx={{ mt: 1, mr: 2 }}
      >
        View All Exercises
      </Button>
      <Button
        variant="outlined"
        startIcon={<LocalOfferIcon />}
        onClick={onOpenTagModal}
        sx={{ mt: 1, mr: 2 }}
      >
        Manage Tags
      </Button>
      <Button
        variant="outlined"
        startIcon={<AddCircleIcon />}
        onClick={onCreateExercise}
        sx={{ mt: 1 }}
      >
        Create Exercise
      </Button>
    </Box>
  );
};