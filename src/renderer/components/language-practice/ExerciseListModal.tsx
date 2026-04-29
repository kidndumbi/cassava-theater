import React from "react";
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Chip, 
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Pagination,
  Stack
} from "@mui/material";
import { 
  ExpandMore, 
  FileCopy, 
  Delete, 
  Edit, 
  PlayArrow,
  FilterList,
  Clear,
  Search,
  Star
} from "@mui/icons-material";
import { LanguageLearningExerciseModel } from "../../../models/language-learning-exercise.model";
import { AppModal } from "../common/AppModal";

interface ExerciseListModalProps {
  isOpen: boolean;
  onClose: () => void;
  allExercises: LanguageLearningExerciseModel[];
  filteredExercises: LanguageLearningExerciseModel[];
  paginatedExercises: LanguageLearningExerciseModel[];
  currentExercise: LanguageLearningExerciseModel | null;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  getDuplicateGroups: [string, LanguageLearningExerciseModel[]][];
  isDuplicatesSectionExpanded: boolean;
  isBulkDeleting: boolean;
  hasActiveFilters: boolean;
  filters: {
    searchText: string;
    practiceLanguage: 'all' | 'en' | 'es' | 'fr';
    nativeLanguage: 'all' | 'en' | 'es' | 'fr';
    difficulty: 'all' | 'easy' | 'medium' | 'hard';
    practiceStatus: 'all' | 'never' | 'low-accuracy' | 'high-accuracy' | 'favorites';
    videoSource: string;
    tags: string[];
  };
  uniqueVideoSources: string[];
  uniqueExerciseTags: string[];
  isFavorite: (exercise: LanguageLearningExerciseModel) => boolean;
  onSetCurrentPage: (page: number) => void;
  onSetDuplicatesSectionExpanded: (expanded: boolean) => void;
  onBulkDeleteClick: () => void;
  onSelectExercise: (exercise: LanguageLearningExerciseModel) => void;
  onEditExercise: (exercise: LanguageLearningExerciseModel) => void;
  onDeleteExercise: (exercise: LanguageLearningExerciseModel) => void;
  onUpdateFilter: <K extends keyof ExerciseListModalProps['filters']>(key: K, value: ExerciseListModalProps['filters'][K]) => void;
  onClearFilters: () => void;
}

export const ExerciseListModal: React.FC<ExerciseListModalProps> = ({
  isOpen,
  onClose,
  allExercises,
  filteredExercises,
  paginatedExercises,
  currentExercise,
  currentPage,
  totalPages,
  getDuplicateGroups,
  isDuplicatesSectionExpanded,
  isBulkDeleting,
  hasActiveFilters,
  filters,
  uniqueVideoSources,
  uniqueExerciseTags,
  isFavorite,
  onSetCurrentPage,
  onSetDuplicatesSectionExpanded,
  onBulkDeleteClick,
  onSelectExercise,
  onEditExercise,
  onDeleteExercise,
  onUpdateFilter,
  onClearFilters,
}) => {
  return (
    <AppModal
      open={isOpen}
      onClose={onClose}
      title={`All Exercises (${allExercises.length})`}
      fullScreen={true}
    >
      <Box sx={{ p: 3 }}>
        {/* Summary Statistics */}
        <Card sx={{ mb: 3, bgcolor: 'info.dark' }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
              Exercise Database Summary
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip 
                label={`${allExercises.length} Total Exercises`} 
                color="primary" 
                variant="outlined" 
              />
              <Chip 
                label={`${getDuplicateGroups.length} Duplicate Groups`} 
                color="warning" 
                variant="outlined" 
              />
              <Chip 
                label={`${getDuplicateGroups.reduce((sum, [_, exercises]) => sum + exercises.length, 0)} Duplicate Exercises`} 
                color="error" 
                variant="outlined" 
              />
              <Chip 
                label={`${new Set(allExercises.map(ex => ex.practiceLanguage)).size} Languages`} 
                color="secondary" 
                variant="outlined" 
              />
              <Chip 
                label={`${new Set(allExercises.map(ex => ex.videoFileName)).size} Videos`} 
                color="success" 
                variant="outlined" 
              />
              <Chip 
                label={`${allExercises.filter(ex => isFavorite(ex)).length} Favorites`} 
                sx={{ color: 'gold', borderColor: 'gold' }}
                variant="outlined" 
              />
            </Box>
          </CardContent>
        </Card>

        {/* Duplicate Groups */}
        {getDuplicateGroups.length > 0 && (
          <Accordion 
            expanded={isDuplicatesSectionExpanded}
            onChange={(_, isExpanded) => onSetDuplicatesSectionExpanded(isExpanded)}
            sx={{ mb: 4, bgcolor: 'warning.dark' }}
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', pr: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'white' }}>
                  <FileCopy color="warning" />
                  Duplicate Exercises ({getDuplicateGroups.length} groups)
                </Typography>
                {getDuplicateGroups.length > 0 && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onBulkDeleteClick();
                    }}
                    variant="contained"
                    color="error"
                    size="small"
                    startIcon={<Delete />}
                    disabled={isBulkDeleting}
                    sx={{ ml: 2 }}
                  >
                    {isBulkDeleting ? 'Removing...' : 'Remove All Duplicates'}
                  </Button>
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {getDuplicateGroups.map(([text, exercises], groupIndex) => (
                <Accordion key={groupIndex} sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        "{text.length > 50 ? text.substring(0, 50) + '...' : text}"
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {exercises.length} duplicates • Languages: {[...new Set(exercises.map(ex => `${ex.practiceLanguage}→${ex.nativeLanguage}`))].join(', ')}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Language</TableCell>
                            <TableCell>Video</TableCell>
                            <TableCell>Created</TableCell>
                            <TableCell>Practice</TableCell>
                            <TableCell>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {exercises.map((exercise, index) => (
                            <TableRow key={exercise.id || index}>
                              <TableCell>
                                <Chip 
                                  label={`${exercise.practiceLanguage} → ${exercise.nativeLanguage}`}
                                  size="small"
                                  color={index === 0 ? 'success' : 'error'}
                                />
                              </TableCell>
                              <TableCell>{exercise.videoFileName}</TableCell>
                              <TableCell>{new Date(exercise.createdAt).toLocaleDateString()}</TableCell>
                              <TableCell>
                                {exercise.practiceCount ? `${exercise.practiceCount} attempts` : 'Never'}
                              </TableCell>
                              <TableCell>
                                <IconButton 
                                  size="small" 
                                  onClick={() => onSelectExercise(exercise)}
                                  title="Select this exercise"
                                >
                                  <PlayArrow />
                                </IconButton>
                                <IconButton 
                                  size="small" 
                                  onClick={() => onEditExercise(exercise)}
                                  title="Edit exercise"
                                >
                                  <Edit />
                                </IconButton>
                                {index > 0 && (
                                  <IconButton 
                                    size="small" 
                                    onClick={() => onDeleteExercise(exercise)}
                                    color="error"
                                    title="Delete duplicate"
                                  >
                                    <Delete />
                                  </IconButton>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </AccordionDetails>
                </Accordion>
              ))}
            </AccordionDetails>
          </Accordion>
        )}

        {/* All Exercises Table */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ color: 'white' }}>
              All Exercises
              {hasActiveFilters && (
                <Chip 
                  label={`${filteredExercises.length} filtered`}
                  size="small" 
                  color="info" 
                  sx={{ ml: 2 }}
                />
              )}
            </Typography>
            <Typography variant="body2" sx={{ color: 'grey.400' }}>
              Showing {filteredExercises.length === 0 ? 0 : ((currentPage - 1) * 25) + 1}-{Math.min(currentPage * 25, filteredExercises.length)} of {filteredExercises.length}
              {hasActiveFilters && (
                <Typography component="span" sx={{ color: 'grey.500', ml: 1 }}>({allExercises.length} total)</Typography>
              )}
            </Typography>
          </Box>

          {/* Filter Controls */}
          <Card sx={{ mb: 3, bgcolor: 'grey.900', border: '1px solid', borderColor: 'grey.700' }}>
            <CardContent sx={{ pb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <FilterList sx={{ color: 'grey.400' }} />
                <Typography variant="subtitle2" sx={{ color: 'grey.300' }}>
                  Filters
                </Typography>
                {hasActiveFilters && (
                  <Button 
                    size="small" 
                    onClick={onClearFilters}
                    startIcon={<Clear />}
                    sx={{ ml: 'auto', color: 'grey.400' }}
                  >
                    Clear All
                  </Button>
                )}
              </Box>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {/* Search */}
                <TextField
                  placeholder="Search exercises, videos..."
                  value={filters.searchText}
                  onChange={(e) => onUpdateFilter('searchText', e.target.value)}
                  size="small"
                  sx={{ minWidth: 250 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: 'grey.400' }} />
                      </InputAdornment>
                    ),
                    sx: { bgcolor: 'grey.800', '& fieldset': { borderColor: 'grey.600' } }
                  }}
                />
                
                {/* Practice Language Filter */}
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel sx={{ color: 'grey.300' }}>Practice Lang</InputLabel>
                  <Select
                    value={filters.practiceLanguage}
                    onChange={(e) => onUpdateFilter('practiceLanguage', e.target.value as any)}
                    sx={{ bgcolor: 'grey.800', '& fieldset': { borderColor: 'grey.600' } }}
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="es">Spanish</MenuItem>
                    <MenuItem value="fr">French</MenuItem>
                  </Select>
                </FormControl>
                
                {/* Native Language Filter */}
                <FormControl size="small" sx={{ minWidth: 130 }}>
                  <InputLabel sx={{ color: 'grey.300' }}>Native Lang</InputLabel>
                  <Select
                    value={filters.nativeLanguage}
                    onChange={(e) => onUpdateFilter('nativeLanguage', e.target.value as any)}
                    sx={{ bgcolor: 'grey.800', '& fieldset': { borderColor: 'grey.600' } }}
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="en">English</MenuItem>
                    <MenuItem value="es">Spanish</MenuItem>
                    <MenuItem value="fr">French</MenuItem>
                  </Select>
                </FormControl>
                
                {/* Difficulty Filter */}
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel sx={{ color: 'grey.300' }}>Difficulty</InputLabel>
                  <Select
                    value={filters.difficulty}
                    onChange={(e) => onUpdateFilter('difficulty', e.target.value as any)}
                    sx={{ bgcolor: 'grey.800', '& fieldset': { borderColor: 'grey.600' } }}
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="easy">Easy</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="hard">Hard</MenuItem>
                  </Select>
                </FormControl>
                
                {/* Video Source Filter */}
                {uniqueVideoSources.length > 1 && (
                  <FormControl size="small" sx={{ minWidth: 180 }}>
                    <InputLabel sx={{ color: 'grey.300' }}>Video Source</InputLabel>
                    <Select
                      value={filters.videoSource}
                      onChange={(e) => onUpdateFilter('videoSource', e.target.value)}
                      sx={{ bgcolor: 'grey.800', '& fieldset': { borderColor: 'grey.600' } }}
                    >
                      <MenuItem value="all">All Videos</MenuItem>
                      {uniqueVideoSources.map((source) => (
                        <MenuItem key={source} value={source}>
                          {source.length > 20 ? `${source.substring(0, 20)}...` : source}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                
                {/* Tags Filter */}
                {uniqueExerciseTags.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'grey.400', mr: 1 }}>
                      Tags:
                    </Typography>
                    {uniqueExerciseTags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        clickable
                        onClick={() => {
                          const currentTags = filters.tags;
                          let newTags: string[];
                          if (currentTags.includes(tag)) {
                            newTags = currentTags.filter(t => t !== tag);
                          } else {
                            newTags = [...currentTags, tag];
                          }
                          onUpdateFilter('tags', newTags);
                        }}
                        color={filters.tags.includes(tag) ? 'primary' : 'info'}
                        variant={filters.tags.includes(tag) ? 'filled' : 'outlined'}
                      />
                    ))}
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Practice Text</TableCell>
                  <TableCell>Translation</TableCell>
                  <TableCell>Languages</TableCell>
                  <TableCell>Statistics</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedExercises.map((exercise) => (
                  <TableRow 
                    key={exercise.id}
                    sx={{ 
                      bgcolor: currentExercise?.id === exercise.id ? 'primary.dark' : 'inherit',
                      '&:hover': { bgcolor: 'grey.800' }
                    }}
                  >
                    <TableCell sx={{ maxWidth: 300 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis',
                          color: currentExercise?.id === exercise.id ? 'primary.contrastText' : 'inherit'
                        }}
                      >
                        {exercise.practiceLanguageText.length > 50 
                          ? exercise.practiceLanguageText.substring(0, 50) + '...'
                          : exercise.practiceLanguageText
                        }
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                        {exercise.difficulty && (
                          <Chip 
                            label={exercise.difficulty} 
                            size="small" 
                            color="secondary"
                            variant="outlined"
                          />
                        )}
                        <Chip 
                          label={`${exercise.wordCount} words`} 
                          size="small" 
                          variant="outlined"
                        />
                        {isFavorite(exercise) && (
                          <Chip 
                            icon={<Star sx={{ fontSize: '12px !important' }} />}
                            label="★" 
                            size="small" 
                            sx={{ 
                              color: 'gold', 
                              borderColor: 'gold',
                              minWidth: 'auto',
                              '& .MuiChip-label': { px: 0.5 }
                            }}
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 250 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis',
                          color: currentExercise?.id === exercise.id ? 'primary.contrastText' : 'text.secondary'
                        }}
                      >
                        {exercise.nativeLanguageText.length > 40 
                          ? exercise.nativeLanguageText.substring(0, 40) + '...'
                          : exercise.nativeLanguageText
                        }
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Video: {exercise.videoFileName && exercise.videoFileName.length > 15 
                          ? exercise.videoFileName.substring(0, 15) + '...'
                          : exercise.videoFileName || 'Manual'
                        }
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={`${exercise.practiceLanguage.toUpperCase()} → ${exercise.nativeLanguage.toUpperCase()}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {exercise.practiceCount ? (
                        <Box>
                          <Typography variant="caption" display="block">
                            {exercise.correctCount || 0}/{exercise.practiceCount} correct
                          </Typography>
                          {exercise.accuracyRate !== undefined && (
                            <Chip
                              label={`${Math.round(exercise.accuracyRate)}%`}
                              size="small"
                              color={exercise.accuracyRate >= 80 ? 'success' : exercise.accuracyRate >= 60 ? 'warning' : 'error'}
                              variant="outlined"
                            />
                          )}
                        </Box>
                      ) : (
                        <Chip 
                          label="Not practiced" 
                          size="small" 
                          variant="outlined"
                          color="default"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton 
                          size="small" 
                          onClick={() => onSelectExercise(exercise)}
                          title="Practice this exercise"
                          color={currentExercise?.id === exercise.id ? 'primary' : 'default'}
                        >
                          <PlayArrow />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => onEditExercise(exercise)}
                          title="Edit exercise"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => onDeleteExercise(exercise)}
                          title="Delete exercise"
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Stack direction="row" justifyContent="center" sx={{ mt: 3 }}>
              <Pagination 
                count={totalPages}
                page={currentPage}
                onChange={(_, page) => onSetCurrentPage(page)}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Stack>
          )}
        </Box>
      </Box>
    </AppModal>
  );
};