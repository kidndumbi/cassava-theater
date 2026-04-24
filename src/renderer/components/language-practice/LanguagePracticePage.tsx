import React, { useEffect, useState } from "react";
import { Box, Typography, Button, Chip, Card, CardContent, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Accordion, AccordionSummary, AccordionDetails, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { School, Refresh, CheckCircle, Cancel, List as ListIcon, ExpandMore, FileCopy, Delete, Edit } from "@mui/icons-material";
import { LanguageLearningExerciseModel } from "../../../models/language-learning-exercise.model";
import { AppModal } from "../common/AppModal";
import { CopyButton } from "../common/CopyButton";
import { useModalState } from "../../hooks/useModalState";

interface LanguagePracticePageProps {
  menuId: string;
}

export const LanguagePracticePage: React.FC<LanguagePracticePageProps> = ({
  menuId,
}) => {
  // Exercise data
  const [allExercises, setAllExercises] = useState<LanguageLearningExerciseModel[]>([]);
  const [currentExercise, setCurrentExercise] = useState<LanguageLearningExerciseModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Exercise state
  const [scrambledWords, setScrambledWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [originalText, setOriginalText] = useState<string>('');
  const [showResult, setShowResult] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [exerciseCompleted, setExerciseCompleted] = useState<boolean>(false);

  // Modal state for exercises list
  const {
    open: isExercisesListOpen,
    openModal: openExercisesList,
    closeModal: closeExercisesList,
  } = useModalState(false);

  // Modal state for delete confirmation
  const {
    open: isDeleteDialogOpen,
    openModal: openDeleteDialog,
    closeModal: closeDeleteDialog,
  } = useModalState(false);

  // Modal state for edit exercise
  const {
    open: isEditDialogOpen,
    openModal: openEditDialog,
    closeModal: closeEditDialog,
  } = useModalState(false);

  // Exercise to delete
  const [exerciseToDelete, setExerciseToDelete] = useState<LanguageLearningExerciseModel | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    practiceLanguageText: '',
    nativeLanguageText: '',
    practiceLanguage: '' as 'en' | 'es' | 'fr' | '',
    nativeLanguage: '' as 'en' | 'es' | 'fr' | '',
    difficulty: '' as 'easy' | 'medium' | 'hard' | ''
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // Load all exercises from database
  const loadExercises = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!window.languageLearningAPI) {
        throw new Error('Language Learning API not available');
      }

      const response = await window.languageLearningAPI.getAllExercises();
      
      if (response.success && response.data) {
        setAllExercises(response.data);
        if (response.data.length > 0) {
          selectNextExercise(response.data);
        } else {
          setError('No exercises found in database. Start watching videos with language learning enabled to collect exercises.');
        }
      } else {
        throw new Error(response.error || 'Failed to load exercises');
      }
    } catch (err) {
      console.error('Error loading exercises:', err);
      setError(err instanceof Error ? err.message : 'Failed to load exercises');
    } finally {
      setLoading(false);
    }
  };

  // Select next exercise using smart prioritization algorithm
  const selectNextExercise = (exercises: LanguageLearningExerciseModel[]) => {
    if (exercises.length === 0) return;
    
    // Smart selection algorithm prioritizing exercises that need attention
    const scoredExercises = exercises.map(exercise => {
      let score = 0;
      
      // Priority 1: Never practiced exercises (highest score)
      if (!exercise.practiceCount || exercise.practiceCount === 0) {
        score += 1000;
      } else {
        // Priority 2: Low practice count (inverse relationship)
        score += Math.max(0, 100 - exercise.practiceCount);
        
        // Priority 3: Low accuracy rate (needs more work)
        if (exercise.accuracyRate !== undefined) {
          score += Math.max(0, 100 - exercise.accuracyRate);
        }
      }
      
      // Priority 4: Older exercises (created earlier, likely seen less recently)
      const daysSinceCreated = (Date.now() - new Date(exercise.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      score += daysSinceCreated * 0.1; // Small bonus for older exercises
      
      // Add small random factor to prevent deterministic selection
      score += Math.random() * 10;
      
      return { exercise, score };
    });
    
    // Sort by score (highest first) and select from top candidates
    scoredExercises.sort((a, b) => b.score - a.score);
    
    // Select from top 20% to maintain some variety while prioritizing neglected exercises
    const topCandidates = Math.max(1, Math.ceil(scoredExercises.length * 0.2));
    const selectedIndex = Math.floor(Math.random() * topCandidates);
    const selectedExercise = scoredExercises[selectedIndex].exercise;
    
    console.log(`Selected exercise with score ${scoredExercises[selectedIndex].score.toFixed(1)}:`, {
      text: selectedExercise.practiceLanguageText.substring(0, 50) + '...',
      practiceCount: selectedExercise.practiceCount || 0,
      accuracyRate: selectedExercise.accuracyRate || 'N/A'
    });
    
    setCurrentExercise(selectedExercise);
    resetExerciseState(selectedExercise.practiceLanguageText);
  };

  // Reset exercise state for a new text
  const resetExerciseState = (text: string) => {
    const cleanText = text.replace(/\n/g, ' ').trim();
    setOriginalText(cleanText);
    
    // Split into words and scramble
    const words = cleanText.split(/\s+/).filter(word => word.length > 0);
    const scrambled = [...words].sort(() => Math.random() - 0.5);
    
    setScrambledWords(scrambled);
    setSelectedWords([]);
    setShowResult(false);
    setIsCorrect(false);
    setExerciseCompleted(false);
  };

  // Handle word selection
  const handleWordClick = (word: string, index: number) => {
    if (exerciseCompleted) return;
    
    setSelectedWords(prev => [...prev, word]);
    setScrambledWords(prev => prev.filter((_, i) => i !== index));
  };

  // Handle word removal
  const handleRemoveWord = (index: number) => {
    if (exerciseCompleted) return;
    
    const word = selectedWords[index];
    setSelectedWords(prev => prev.filter((_, i) => i !== index));
    setScrambledWords(prev => [...prev, word]);
  };

  // Submit answer
  const handleSubmit = async () => {
    if (selectedWords.length === 0) return;
    
    const userText = selectedWords.join(' ');
    const correct = userText === originalText;
    
    setIsCorrect(correct);
    setShowResult(true);
    setExerciseCompleted(true);

    // Update exercise statistics
    if (currentExercise?.id && window.languageLearningAPI) {
      try {
        await window.languageLearningAPI.updateExerciseStats(currentExercise.id, correct);
      } catch (error) {
        console.error('Failed to update exercise stats:', error);
      }
    }
  };

  // Reset current exercise
  const handleReset = () => {
    if (currentExercise) {
      resetExerciseState(currentExercise.practiceLanguageText);
    }
  };

  // Get next prioritized exercise
  const handleNext = () => {
    selectNextExercise(allExercises);
  };

  // Handle delete exercise confirmation
  const handleDeleteClick = (exercise: LanguageLearningExerciseModel) => {
    setExerciseToDelete(exercise);
    openDeleteDialog();
  };

  // Handle edit exercise
  const handleEditClick = () => {
    if (!currentExercise) return;
    
    setEditForm({
      practiceLanguageText: currentExercise.practiceLanguageText,
      nativeLanguageText: currentExercise.nativeLanguageText,
      practiceLanguage: currentExercise.practiceLanguage,
      nativeLanguage: currentExercise.nativeLanguage,
      difficulty: currentExercise.difficulty || ''
    });
    openEditDialog();
  };

  // Handle edit form submission
  const handleEditSubmit = async () => {
    if (!currentExercise?.id || !window.languageLearningAPI) return;

    setIsUpdating(true);
    try {
      const updatedExercise: LanguageLearningExerciseModel = {
        ...currentExercise,
        practiceLanguageText: editForm.practiceLanguageText,
        nativeLanguageText: editForm.nativeLanguageText,
        practiceLanguage: editForm.practiceLanguage as 'en' | 'es' | 'fr',
        nativeLanguage: editForm.nativeLanguage as 'en' | 'es' | 'fr',
        difficulty: editForm.difficulty || undefined,
        wordCount: editForm.practiceLanguageText.split(/\s+/).filter(word => word.length > 0).length
      };

      const response = await window.languageLearningAPI.updateExercise(currentExercise.id, updatedExercise);
      
      if (response.success) {
        // Update current exercise
        setCurrentExercise(updatedExercise);
        
        // Update exercises list
        setAllExercises(prev => prev.map(ex => 
          ex.id === currentExercise.id ? updatedExercise : ex
        ));
        
        // Reset exercise state with new text
        resetExerciseState(updatedExercise.practiceLanguageText);
        
        closeEditDialog();
        console.log('Exercise updated successfully:', currentExercise.id);
      } else {
        console.error('Failed to update exercise:', response.error);
        alert('Failed to update exercise: ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating exercise:', error);
      alert('Error updating exercise: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsUpdating(false);
    }
  };

  // Confirm delete exercise
  const handleConfirmDelete = async () => {
    if (!exerciseToDelete?.id || !window.languageLearningAPI) return;

    try {
      const response = await window.languageLearningAPI.deleteExercise(exerciseToDelete.id);
      if (response.success) {
        // Remove from local state
        const updatedExercises = allExercises.filter(ex => ex.id !== exerciseToDelete.id);
        setAllExercises(updatedExercises);
        
        // If this was the current exercise, select a new one
        if (currentExercise?.id === exerciseToDelete.id) {
          if (updatedExercises.length > 0) {
            selectNextExercise(updatedExercises);
          } else {
            setCurrentExercise(null);
            setError('No exercises remaining in database.');
          }
        }
        
        console.log('Exercise deleted successfully:', exerciseToDelete.id);
      } else {
        console.error('Failed to delete exercise:', response.error);
      }
    } catch (error) {
      console.error('Error deleting exercise:', error);
    } finally {
      closeDeleteDialog();
      setExerciseToDelete(null);
    }
  };

  // Function to identify and group duplicate exercises
  const getDuplicateGroups = () => {
    const groups: { [key: string]: LanguageLearningExerciseModel[] } = {};
    
    allExercises.forEach(exercise => {
      const key = exercise.practiceLanguageText.trim().toLowerCase();
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(exercise);
    });
    
    // Return only groups with more than one exercise (duplicates)
    return Object.entries(groups).filter(([_, exercises]) => exercises.length > 1);
  };

  // Load exercises on component mount
  useEffect(() => {
    loadExercises();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "60vh",
          padding: 3,
        }}
      >
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Loading exercises...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "60vh",
          padding: 3,
          textAlign: "center",
        }}
      >
        <School sx={{ fontSize: 80, mb: 2, color: "text.disabled" }} />
        <Typography variant="h5" component="h1" gutterBottom color="error">
          No Exercises Available
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 600 }}>
          {error}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={loadExercises}
        >
          Retry
        </Button>
      </Box>
    );
  }

  if (!currentExercise) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "60vh",
          padding: 3,
        }}
      >
        <Typography variant="h6" color="text.secondary">
          No exercise selected
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: 1000,
        margin: "0 auto",
        padding: 3,
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <School sx={{ fontSize: 60, mb: 2, color: "primary.main" }} />
        <Typography variant="h4" component="h1" gutterBottom>
          Language Practice
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Total exercises available: {allExercises.length}
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ListIcon />}
          onClick={openExercisesList}
          sx={{ mt: 1 }}
        >
          View All Exercises
        </Button>
      </Box>

      {/* Exercise Card */}
      <Card 
        sx={{ 
          bgcolor: 'primary.dark', 
          color: 'primary.contrastText',
          mb: 3,
          minHeight: 500
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Exercise Info */}
          <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip 
                label={`${currentExercise.practiceLanguage.toUpperCase()} → ${currentExercise.nativeLanguage.toUpperCase()}`} 
                size="small" 
                color="secondary"
              />
              {currentExercise.difficulty && (
                <Chip 
                  label={currentExercise.difficulty} 
                  size="small" 
                  variant="outlined"
                  sx={{ color: 'white', borderColor: 'white' }}
                />
              )}
              <Chip 
                label={`${currentExercise.wordCount} words`} 
                size="small" 
                variant="outlined"
                sx={{ color: 'white', borderColor: 'white' }}
              />
            </Box>
            
            {/* Practice Statistics */}
            {(currentExercise.practiceCount && currentExercise.practiceCount > 0) && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip 
                  label={`${currentExercise.practiceCount} attempts`}
                  size="small" 
                  variant="outlined"
                  sx={{ color: 'lightblue', borderColor: 'lightblue' }}
                />
                <Chip 
                  label={`${currentExercise.correctCount || 0} correct`}
                  size="small" 
                  variant="outlined"
                  sx={{ color: 'lightgreen', borderColor: 'lightgreen' }}
                />
                <Chip 
                  label={`${(currentExercise.practiceCount - (currentExercise.correctCount || 0))} wrong`}
                  size="small" 
                  variant="outlined"
                  sx={{ color: 'lightcoral', borderColor: 'lightcoral' }}
                />
                {currentExercise.accuracyRate !== undefined && (
                  <Chip 
                    label={`${Math.round(currentExercise.accuracyRate)}% accuracy`}
                    size="small" 
                    variant="outlined"
                    sx={{ color: 'gold', borderColor: 'gold' }}
                  />
                )}
              </Box>
            )}
            
            {/* Edit Button */}
            <Button
              onClick={handleEditClick}
              variant="outlined"
              size="small"
              startIcon={<Edit />}
              sx={{ color: 'white', borderColor: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
            >
              Edit
            </Button>
          </Box>

          {/* Native Language Reference */}
          <Card sx={{ mb: 4, bgcolor: 'grey.800', border: '1px solid', borderColor: 'grey.600', position: 'relative' }}>
            <CardContent sx={{ py: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" sx={{ color: 'grey.400', mb: 1, display: 'block' }}>
                    Reference ({currentExercise.nativeLanguage.toUpperCase()}):
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: 'white',
                      textAlign: 'center',
                      fontSize: '1.1rem',
                      lineHeight: 1.5
                    }}
                  >
                    {currentExercise.nativeLanguageText}
                  </Typography>
                </Box>
                <CopyButton 
                  text={currentExercise.nativeLanguageText}
                  color="inherit"
                  sx={{ color: 'grey.400', '&:hover': { color: 'white' } }}
                />
              </Box>
            </CardContent>
          </Card>

          {/* User's Arrangement */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="caption" sx={{ color: 'primary.light', mb: 1, display: 'block' }}>
              Your arrangement:
            </Typography>
            <Box 
              sx={{
                bgcolor: 'primary.light',
                color: 'primary.dark',
                p: 2,
                borderRadius: 1,
                minHeight: 60,
                border: '2px dashed',
                borderColor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {selectedWords.length === 0 ? (
                <Typography sx={{ fontStyle: 'italic', color: 'primary.main' }}>
                  Click words below to arrange them...
                </Typography>
              ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedWords.map((word, index) => (
                    <Button
                      key={`selected-${index}`}
                      onClick={() => handleRemoveWord(index)}
                      disabled={exerciseCompleted}
                      variant="contained"
                      color="success"
                      size="small"
                      sx={{ minWidth: 'auto' }}
                    >
                      {word}
                    </Button>
                  ))}
                </Box>
              )}
            </Box>
          </Box>

          {/* Available Words */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="caption" sx={{ color: 'primary.light', mb: 1, display: 'block' }}>
              Available words:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {scrambledWords.map((word, index) => (
                <Button
                  key={`scrambled-${index}`}
                  onClick={() => handleWordClick(word, index)}
                  disabled={exerciseCompleted}
                  variant="outlined"
                  sx={{ 
                    color: 'white', 
                    borderColor: 'white',
                    '&:hover': {
                      bgcolor: 'primary.light',
                      color: 'primary.dark'
                    }
                  }}
                >
                  {word}
                </Button>
              ))}
            </Box>
          </Box>

          {/* Control Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3 }}>
            <Button
              onClick={handleSubmit}
              disabled={selectedWords.length === 0 || exerciseCompleted}
              variant="contained"
              color="success"
              startIcon={<CheckCircle />}
            >
              Submit
            </Button>
            <Button
              onClick={handleReset}
              variant="contained"
              color="warning"
              startIcon={<Refresh />}
            >
              Reset
            </Button>
            {exerciseCompleted && (
              <Button
                onClick={handleNext}
                variant="contained"
                color="secondary"
                startIcon={<School />}
              >
                Next Exercise
              </Button>
            )}
          </Box>

          {/* Result Feedback */}
          {showResult && (
            <Card 
              sx={{ 
                bgcolor: isCorrect ? 'success.dark' : 'error.dark',
                textAlign: 'center',
                position: 'relative'
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        color: 'white',
                        mb: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1
                      }}
                    >
                      {isCorrect ? (
                        <>
                          <CheckCircle /> Correct!
                        </>
                      ) : (
                        <>
                          <Cancel /> Incorrect
                        </>
                      )}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'white', opacity: 0.9 }}>
                      {isCorrect ? `"${originalText}"` : `Correct answer: "${originalText}"`}
                    </Typography>
                  </Box>
                  <CopyButton 
                    text={originalText}
                    color="inherit"
                    sx={{ color: 'white', opacity: 0.8, '&:hover': { opacity: 1 } }}
                  />
                </Box>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Exercise Source Info */}
      {currentExercise.videoFileName && (
        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: 'white' }}>
          From: {currentExercise.videoFileName}
        </Typography>
      )}

      {/* Exercises List Modal */}
      <AppModal
        open={isExercisesListOpen}
        onClose={closeExercisesList}
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
                  label={`${getDuplicateGroups().length} Duplicate Groups`} 
                  color="warning" 
                  variant="outlined" 
                />
                <Chip 
                  label={`${getDuplicateGroups().reduce((sum, [_, exercises]) => sum + exercises.length, 0)} Duplicate Exercises`} 
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
              </Box>
            </CardContent>
          </Card>

          {/* Duplicate Groups */}
          {getDuplicateGroups().length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: 'white' }}>
                <FileCopy color="warning" />
                Duplicate Exercises ({getDuplicateGroups().length} groups)
              </Typography>
              
              {getDuplicateGroups().map(([text, exercises], groupIndex) => (
                <Accordion key={groupIndex} sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        "{text.length > 80 ? text.substring(0, 80) + '...' : text}"
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {exercises.length} duplicates • Languages: {[...new Set(exercises.map(ex => ex.practiceLanguage))].join(', ')}
                      </Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Video</TableCell>
                            <TableCell>Language</TableCell>
                            <TableCell>Time</TableCell>
                            <TableCell>Practiced</TableCell>
                            <TableCell>Accuracy</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {exercises.map((exercise, exIndex) => (
                            <TableRow key={exIndex}>
                              <TableCell>
                                <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {exercise.videoFileName || 'Unknown'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip 
                                  label={`${exercise.practiceLanguage} → ${exercise.nativeLanguage}`} 
                                  size="small" 
                                  color="secondary" 
                                />
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2">
                                  {Math.floor(exercise.startTime / 60)}:{String(Math.floor(exercise.startTime % 60)).padStart(2, '0')}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                {exercise.practiceCount ? (
                                  <Typography variant="body2">
                                    {exercise.practiceCount} times
                                  </Typography>
                                ) : (
                                  <Typography variant="body2" color="text.secondary">
                                    Never
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                {exercise.accuracyRate !== undefined ? (
                                  <Chip 
                                    label={`${Math.round(exercise.accuracyRate)}%`} 
                                    size="small" 
                                    color={exercise.accuracyRate >= 80 ? 'success' : exercise.accuracyRate >= 60 ? 'warning' : 'error'}
                                  />
                                ) : (
                                  <Typography variant="body2" color="text.secondary">
                                    N/A
                                  </Typography>
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
            </Box>
          )}

          {/* All Exercises Table */}
          <Typography variant="h6" sx={{ mb: 2, color: 'white' }}>
            All Exercises
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Practice Text</TableCell>
                  <TableCell>Native Text</TableCell>
                  <TableCell>Languages</TableCell>
                  <TableCell>Video</TableCell>
                  <TableCell>Difficulty</TableCell>
                  <TableCell>Stats</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allExercises.map((exercise, index) => (
                  <TableRow key={exercise.id || index}>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {exercise.practiceLanguageText}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {exercise.nativeLanguageText}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={`${exercise.practiceLanguage} → ${exercise.nativeLanguage}`} 
                        size="small" 
                        color="secondary" 
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {exercise.videoFileName || 'Unknown'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {exercise.difficulty && (
                        <Chip 
                          label={exercise.difficulty} 
                          size="small" 
                          color={exercise.difficulty === 'easy' ? 'success' : exercise.difficulty === 'medium' ? 'warning' : 'error'}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {exercise.practiceCount ? (
                        <Box>
                          <Typography variant="caption" display="block">
                            {exercise.correctCount || 0}/{exercise.practiceCount} correct
                          </Typography>
                          {exercise.accuracyRate !== undefined && (
                            <Typography variant="caption" color="text.secondary">
                              {Math.round(exercise.accuracyRate)}% accuracy
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          Not practiced
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {new Date(exercise.createdAt).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        onClick={() => handleDeleteClick(exercise)}
                        color="error"
                        size="small"
                        sx={{ '&:hover': { bgcolor: 'error.dark' } }}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </AppModal>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
      >
        <DialogTitle>Delete Exercise</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete this exercise?
          </Typography>
          {exerciseToDelete && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                <strong>Practice Text:</strong> {exerciseToDelete.practiceLanguageText}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                <strong>Native Text:</strong> {exerciseToDelete.nativeLanguageText}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>From:</strong> {exerciseToDelete.videoFileName || 'Unknown video'}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Exercise Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onClose={closeEditDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Exercise</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            <TextField
              label="Practice Language Text"
              multiline
              rows={3}
              value={editForm.practiceLanguageText}
              onChange={(e) => setEditForm(prev => ({ ...prev, practiceLanguageText: e.target.value }))}
              fullWidth
              helperText="The text that users will practice arranging"
            />
            
            <TextField
              label="Native Language Text (Reference)"
              multiline
              rows={3}
              value={editForm.nativeLanguageText}
              onChange={(e) => setEditForm(prev => ({ ...prev, nativeLanguageText: e.target.value }))}
              fullWidth
              helperText="The reference text shown to help users"
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Practice Language</InputLabel>
                <Select
                  value={editForm.practiceLanguage}
                  label="Practice Language"
                  onChange={(e) => setEditForm(prev => ({ ...prev, practiceLanguage: e.target.value as 'en' | 'es' | 'fr' | '' }))}
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="es">Spanish</MenuItem>
                  <MenuItem value="fr">French</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth>
                <InputLabel>Native Language</InputLabel>
                <Select
                  value={editForm.nativeLanguage}
                  label="Native Language"
                  onChange={(e) => setEditForm(prev => ({ ...prev, nativeLanguage: e.target.value as 'en' | 'es' | 'fr' | '' }))}
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
                value={editForm.difficulty}
                label="Difficulty"
                onChange={(e) => setEditForm(prev => ({ ...prev, difficulty: e.target.value as 'easy' | 'medium' | 'hard' | '' }))}
              >
                <MenuItem value="">Not Set</MenuItem>
                <MenuItem value="easy">Easy</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="hard">Hard</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              if (currentExercise) {
                closeEditDialog();
                handleDeleteClick(currentExercise);
              }
            }}
            color="error"
            startIcon={<Delete />}
            sx={{ mr: 'auto' }}
          >
            Delete
          </Button>
          <Button onClick={closeEditDialog} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleEditSubmit} 
            color="primary" 
            variant="contained"
            disabled={isUpdating || !editForm.practiceLanguageText.trim() || !editForm.nativeLanguageText.trim()}
          >
            {isUpdating ? 'Updating...' : 'Update Exercise'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};