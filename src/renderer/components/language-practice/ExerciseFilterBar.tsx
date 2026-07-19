import React from "react";
import {
  Box, Typography, Card, CardContent, Chip, Button,
  TextField, FormControl, InputLabel, Select, MenuItem, InputAdornment,
} from "@mui/material";
import { FilterList, Clear, Search } from "@mui/icons-material";

interface ExerciseFilters {
  searchText: string;
  practiceLanguage: 'all' | 'en' | 'es' | 'fr';
  nativeLanguage: 'all' | 'en' | 'es' | 'fr';
  difficulty: 'all' | 'easy' | 'medium' | 'hard';
  practiceStatus: 'all' | 'never' | 'low-accuracy' | 'high-accuracy' | 'favorites';
  videoSource: string;
  tags: string[];
}

interface ExerciseFilterBarProps {
  filters: ExerciseFilters;
  hasActiveFilters: boolean;
  uniqueVideoSources: string[];
  uniqueExerciseTags: string[];
  filteredCount: number;
  onUpdateFilter: <K extends keyof ExerciseFilters>(key: K, value: ExerciseFilters[K]) => void;
  onClearFilters: () => void;
}

export const ExerciseFilterBar: React.FC<ExerciseFilterBarProps> = ({
  filters,
  hasActiveFilters,
  uniqueVideoSources,
  uniqueExerciseTags,
  filteredCount,
  onUpdateFilter,
  onClearFilters,
}) => (
  <Card sx={{ mb: 3, bgcolor: "grey.900", border: "1px solid", borderColor: "grey.700" }}>
    <CardContent sx={{ pb: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <FilterList sx={{ color: "grey.400" }} />
        <Typography variant="subtitle2" sx={{ color: "grey.300" }}>Filters</Typography>
        {hasActiveFilters && (
          <Button size="small" onClick={onClearFilters} startIcon={<Clear />} sx={{ ml: "auto", color: "grey.400" }}>
            Clear All
          </Button>
        )}
      </Box>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        <TextField
          placeholder="Search exercises, videos..."
          value={filters.searchText}
          onChange={(e) => onUpdateFilter("searchText", e.target.value)}
          size="small"
          sx={{ minWidth: 250 }}
          InputProps={{
            startAdornment: (<InputAdornment position="start"><Search sx={{ color: "grey.400" }} /></InputAdornment>),
            sx: { bgcolor: "grey.800", "& fieldset": { borderColor: "grey.600" } },
          }}
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel sx={{ color: "grey.300" }}>Practice Lang</InputLabel>
          <Select value={filters.practiceLanguage} onChange={(e) => onUpdateFilter("practiceLanguage", e.target.value as any)}
            sx={{ bgcolor: "grey.800", "& fieldset": { borderColor: "grey.600" } }}>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="es">Spanish</MenuItem>
            <MenuItem value="fr">French</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel sx={{ color: "grey.300" }}>Native Lang</InputLabel>
          <Select value={filters.nativeLanguage} onChange={(e) => onUpdateFilter("nativeLanguage", e.target.value as any)}
            sx={{ bgcolor: "grey.800", "& fieldset": { borderColor: "grey.600" } }}>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="es">Spanish</MenuItem>
            <MenuItem value="fr">French</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel sx={{ color: "grey.300" }}>Difficulty</InputLabel>
          <Select value={filters.difficulty} onChange={(e) => onUpdateFilter("difficulty", e.target.value as any)}
            sx={{ bgcolor: "grey.800", "& fieldset": { borderColor: "grey.600" } }}>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="easy">Easy</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="hard">Hard</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel sx={{ color: "grey.300" }}>Practice Status</InputLabel>
          <Select value={filters.practiceStatus} onChange={(e) => onUpdateFilter("practiceStatus", e.target.value as any)}
            sx={{ bgcolor: "grey.800", "& fieldset": { borderColor: "grey.600" } }}>
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="never">Not Practiced</MenuItem>
            <MenuItem value="low-accuracy">{"Low Accuracy (<60%)"}</MenuItem>
            <MenuItem value="high-accuracy">{"High Accuracy (≥80%)"}</MenuItem>
            <MenuItem value="favorites">Favorites</MenuItem>
          </Select>
        </FormControl>
        {uniqueVideoSources.length > 1 && (
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel sx={{ color: "grey.300" }}>Video Source</InputLabel>
            <Select value={filters.videoSource} onChange={(e) => onUpdateFilter("videoSource", e.target.value)}
              sx={{ bgcolor: "grey.800", "& fieldset": { borderColor: "grey.600" } }}>
              <MenuItem value="all">All Videos</MenuItem>
              {uniqueVideoSources.map((source) => (
                <MenuItem key={source} value={source}>{source.length > 20 ? `${source.substring(0, 20)}...` : source}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        {uniqueExerciseTags.length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center" }}>
            <Typography variant="caption" sx={{ color: "grey.400", mr: 1 }}>Tags:</Typography>
            {uniqueExerciseTags.map((tag) => (
              <Chip key={tag} label={tag} size="small" clickable
                onClick={() => {
                  const currentTags = filters.tags;
                  const newTags = currentTags.includes(tag) ? currentTags.filter((t) => t !== tag) : [...currentTags, tag];
                  onUpdateFilter("tags", newTags);
                }}
                color={filters.tags.includes(tag) ? "primary" : "info"}
                variant={filters.tags.includes(tag) ? "filled" : "outlined"}
              />
            ))}
          </Box>
        )}
      </Box>
    </CardContent>
  </Card>
);