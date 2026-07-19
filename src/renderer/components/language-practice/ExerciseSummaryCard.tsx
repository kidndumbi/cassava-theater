import React from "react";
import { Box, Typography, Card, CardContent, Chip } from "@mui/material";
import { LanguageLearningExerciseModel } from "../../../models/language-learning-exercise.model";

interface ExerciseSummaryCardProps {
  allExercises: LanguageLearningExerciseModel[];
  getDuplicateGroups: [string, LanguageLearningExerciseModel[]][];
  isFavorite: (exercise: LanguageLearningExerciseModel) => boolean;
}

export const ExerciseSummaryCard: React.FC<ExerciseSummaryCardProps> = ({
  allExercises,
  getDuplicateGroups,
  isFavorite,
}) => (
  <Card sx={{ mb: 3, bgcolor: "info.dark" }}>
    <CardContent>
      <Typography variant="h6" sx={{ color: "white", mb: 2 }}>
        Exercise Database Summary
      </Typography>
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Chip label={`${allExercises.length} Total Exercises`} color="primary" variant="outlined" />
        <Chip label={`${getDuplicateGroups.length} Duplicate Groups`} color="warning" variant="outlined" />
        <Chip
          label={`${getDuplicateGroups.reduce((sum, [_, exercises]) => sum + exercises.length, 0)} Duplicate Exercises`}
          color="error"
          variant="outlined"
        />
        <Chip
          label={`${new Set(allExercises.map((ex) => ex.practiceLanguage)).size} Languages`}
          color="secondary"
          variant="outlined"
        />
        <Chip
          label={`${new Set(allExercises.map((ex) => ex.videoFileName)).size} Videos`}
          color="success"
          variant="outlined"
        />
        <Chip
          label={`${allExercises.filter((ex) => isFavorite(ex)).length} Favorites`}
          sx={{ color: "gold", borderColor: "gold" }}
          variant="outlined"
        />
      </Box>
    </CardContent>
  </Card>
);