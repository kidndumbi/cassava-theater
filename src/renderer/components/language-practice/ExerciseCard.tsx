import React from "react";
import { Box, Typography, Button, Chip, Card, CardContent, IconButton } from "@mui/material";
import { 
  CheckCircle, 
  Cancel, 
  Refresh, 
  School, 
  Edit, 
  Star, 
  StarBorder, 
  Bookmark, 
  BookmarkBorder,
  Translate 
} from "@mui/icons-material";
import { LanguageLearningExerciseModel } from "../../../models/language-learning-exercise.model";
import { CopyButton } from "../common/CopyButton";

interface ExerciseCardProps {
  exercise: LanguageLearningExerciseModel;
  scrambledWords: string[];
  selectedWords: string[];
  originalText: string;
  showResult: boolean;
  isCorrect: boolean;
  exerciseCompleted: boolean;
  isFavorite: boolean;
  isMarkedForReview: boolean;
  onWordClick: (word: string, index: number) => void;
  onRemoveWord: (index: number) => void;
  onSubmit: () => void;
  onReset: () => void;
  onNext: () => void;
  onToggleFavorite: () => void;
  onToggleReview: () => void;
  onEdit: () => void;
  onOpenGoogleTranslate: (text: string, sourceLang: string, targetLang: string) => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  scrambledWords,
  selectedWords,
  originalText,
  showResult,
  isCorrect,
  exerciseCompleted,
  isFavorite,
  isMarkedForReview,
  onWordClick,
  onRemoveWord,
  onSubmit,
  onReset,
  onNext,
  onToggleFavorite,
  onToggleReview,
  onEdit,
  onOpenGoogleTranslate,
}) => {
  const normalizeWord = (word: string) => word.replace(/[.,?!¿¡]/g, '').toLowerCase();
  return (
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
              label={`${exercise.practiceLanguage.toUpperCase()} → ${exercise.nativeLanguage.toUpperCase()}`} 
              size="small" 
              color="secondary"
            />
            {exercise.difficulty && (
              <Chip 
                label={exercise.difficulty} 
                size="small" 
                variant="outlined"
                sx={{ color: 'white', borderColor: 'white' }}
              />
            )}
            <Chip 
              label={`${exercise.wordCount} words`} 
              size="small" 
              variant="outlined"
              sx={{ color: 'white', borderColor: 'white' }}
            />
            {isFavorite && (
              <Chip 
                icon={<Star sx={{ fontSize: '16px !important' }} />}
                label="Favorite" 
                size="small" 
                sx={{ 
                  color: 'gold', 
                  borderColor: 'gold',
                  '& .MuiChip-icon': { color: 'gold' }
                }}
                variant="outlined"
              />
            )}
            {/* Show current exercise tags */}
            {exercise.tags && exercise.tags.length > 0 && (
              <>
                {exercise.tags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    variant="outlined"
                    sx={{ color: 'lightblue', borderColor: 'lightblue' }}
                  />
                ))}
              </>
            )}
          </Box>
          
          {/* Practice Statistics */}
          {(exercise.practiceCount && exercise.practiceCount > 0) && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip 
                label={`${exercise.practiceCount} attempts`}
                size="small" 
                variant="outlined"
                sx={{ color: 'lightblue', borderColor: 'lightblue' }}
              />
              <Chip 
                label={`${exercise.correctCount || 0} correct`}
                size="small" 
                variant="outlined"
                sx={{ color: 'lightgreen', borderColor: 'lightgreen' }}
              />
              <Chip 
                label={`${(exercise.practiceCount - (exercise.correctCount || 0))} wrong`}
                size="small" 
                variant="outlined"
                sx={{ color: 'lightcoral', borderColor: 'lightcoral' }}
              />
              {exercise.accuracyRate !== undefined && (
                <Chip 
                  label={`${Math.round(exercise.accuracyRate)}% accuracy`}
                  size="small" 
                  variant="outlined"
                  sx={{ color: 'gold', borderColor: 'gold' }}
                />
              )}
            </Box>
          )}
          
          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              onClick={onToggleFavorite}
              variant="outlined"
              size="small"
              startIcon={isFavorite ? <Star /> : <StarBorder />}
              sx={{ 
                color: isFavorite ? 'gold' : 'white', 
                borderColor: isFavorite ? 'gold' : 'white', 
                '&:hover': { 
                  bgcolor: isFavorite ? 'rgba(255,215,0,0.1)' : 'rgba(255,255,255,0.1)' 
                } 
              }}
            >
              {isFavorite ? 'Favorited' : 'Favorite'}
            </Button>
            <Button
              onClick={onToggleReview}
              variant="outlined"
              size="small"
              startIcon={isMarkedForReview ? <Bookmark /> : <BookmarkBorder />}
              sx={{ 
                color: isMarkedForReview ? 'lightblue' : 'white', 
                borderColor: isMarkedForReview ? 'lightblue' : 'white', 
                '&:hover': { 
                  bgcolor: isMarkedForReview ? 'rgba(173,216,230,0.1)' : 'rgba(255,255,255,0.1)' 
                } 
              }}
            >
              Review
            </Button>
            <Button
              onClick={onEdit}
              variant="outlined"
              size="small"
              startIcon={<Edit />}
              sx={{ color: 'white', borderColor: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
            >
              Edit
            </Button>
          </Box>
        </Box>

        {/* Native Language Reference */}
        <Card sx={{ mb: 4, bgcolor: 'grey.800', border: '1px solid', borderColor: 'grey.600', position: 'relative' }}>
          <CardContent sx={{ py: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: 'grey.400', mb: 1, display: 'block' }}>
                  Reference ({exercise.nativeLanguage.toUpperCase()}):
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
                  {exercise.nativeLanguageText}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <CopyButton 
                  text={exercise.nativeLanguageText}
                  color="inherit"
                  sx={{ color: 'grey.400', '&:hover': { color: 'white' } }}
                />
                {showResult && (
                  <IconButton
                    onClick={() => onOpenGoogleTranslate(
                      exercise.nativeLanguageText, 
                      exercise.nativeLanguage, 
                      exercise.practiceLanguage
                    )}
                    title="Check translation in Google Translate"
                    sx={{ color: 'grey.400', '&:hover': { color: 'white' } }}
                  >
                    <Translate />
                  </IconButton>
                )}
              </Box>
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
                    onClick={() => onRemoveWord(index)}
                    disabled={exerciseCompleted}
                    variant="contained"
                    color="success"
                    size="small"
                    sx={{ minWidth: 'auto' }}
                  >
                    {normalizeWord(word)}
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
                onClick={() => onWordClick(word, index)}
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
                {normalizeWord(word)}
              </Button>
            ))}
          </Box>
        </Box>

        {/* Control Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3 }}>
          <Button
            onClick={onSubmit}
            disabled={selectedWords.length === 0 || exerciseCompleted}
            variant="contained"
            color="success"
            startIcon={<CheckCircle />}
          >
            Submit
          </Button>
          <Button
            onClick={onReset}
            variant="contained"
            color="warning"
            startIcon={<Refresh />}
          >
            Reset
          </Button>
          {exerciseCompleted && (
            <Button
              onClick={onNext}
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
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <CopyButton 
                    text={originalText}
                    color="inherit"
                    sx={{ color: 'white', opacity: 0.8, '&:hover': { opacity: 1 } }}
                  />
                  <IconButton
                    onClick={() => onOpenGoogleTranslate(
                      originalText, 
                      exercise.practiceLanguage, 
                      exercise.nativeLanguage
                    )}
                    title="Check translation in Google Translate"
                    sx={{ color: 'white', opacity: 0.8, '&:hover': { opacity: 1 } }}
                  >
                    <Translate />
                  </IconButton>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};