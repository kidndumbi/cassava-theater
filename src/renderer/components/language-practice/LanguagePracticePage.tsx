import React, { useEffect, useState, useMemo } from "react";
import { Box, Typography, Button, Chip, Card, CardContent, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Accordion, AccordionSummary, AccordionDetails, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, Pagination, Stack, OutlinedInput, InputAdornment, Checkbox, ListItemText } from "@mui/material";
import { School, Refresh, CheckCircle, Cancel, List as ListIcon, ExpandMore, FileCopy, Delete, Edit, Translate, Star, StarBorder, Bookmark, BookmarkBorder, Search, Clear, FilterList, LocalOffer as LocalOfferIcon, Add as AddIcon, AddCircle as AddCircleIcon } from "@mui/icons-material";
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

  // Modal state for tag management
  const {
    open: isTagModalOpen,
    openModal: openTagModal,
    closeModal: closeTagModal,
  } = useModalState(false);

  // Modal state for bulk duplicate removal confirmation
  const {
    open: isBulkDeleteDialogOpen,
    openModal: openBulkDeleteDialog,
    closeModal: closeBulkDeleteDialog,
  } = useModalState(false);

  // Modal state for create exercise
  const {
    open: isCreateDialogOpen,
    openModal: openCreateDialog,
    closeModal: closeCreateDialog,
  } = useModalState(false);

  // Exercise to delete
  const [exerciseToDelete, setExerciseToDelete] = useState<LanguageLearningExerciseModel | null>(null);
  
  // Exercise to edit
  const [exerciseToEdit, setExerciseToEdit] = useState<LanguageLearningExerciseModel | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    practiceLanguageText: '',
    nativeLanguageText: '',
    practiceLanguage: '' as 'en' | 'es' | 'fr' | '',
    nativeLanguage: '' as 'en' | 'es' | 'fr' | '',
    difficulty: '' as 'easy' | 'medium' | 'hard' | ''
  });
  const [isUpdating, setIsUpdating] = useState(false);

  // Create form state
  const [createForm, setCreateForm] = useState({
    practiceLanguageText: '',
    nativeLanguageText: '',
    practiceLanguage: '' as 'en' | 'es' | 'fr' | '',
    nativeLanguage: '' as 'en' | 'es' | 'fr' | '',
    difficulty: '' as 'easy' | 'medium' | 'hard' | ''
  });
  const [isCreating, setIsCreating] = useState(false);
  
  // Tag management state
  const [allTags, setAllTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [isDeletingTag, setIsDeletingTag] = useState<string | null>(null);
  const [tagError, setTagError] = useState<string | null>(null);
  
  // State for collapsible duplicate exercises section
  const [isDuplicatesSectionExpanded, setIsDuplicatesSectionExpanded] = useState(false);
  
  // State for bulk duplicate removal
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(25); // Exercises per page
  
  // Edit form tag management
  const [editFormTags, setEditFormTags] = useState<string[]>([]);
  const [editFormNewTag, setEditFormNewTag] = useState('');
  
  // Create form tag management
  const [createFormTags, setCreateFormTags] = useState<string[]>([]);
  const [createFormNewTag, setCreateFormNewTag] = useState('');
  
  // Filter state
  const [filters, setFilters] = useState({
    searchText: '',
    practiceLanguage: 'all' as 'all' | 'en' | 'es' | 'fr',
    nativeLanguage: 'all' as 'all' | 'en' | 'es' | 'fr',
    difficulty: 'all' as 'all' | 'easy' | 'medium' | 'hard',
    practiceStatus: 'all' as 'all' | 'never' | 'low-accuracy' | 'high-accuracy' | 'favorites',
    videoSource: 'all' as string,
    tags: [] as string[]
  });

  // Generate Google Translate URL
  const generateGoogleTranslateUrl = (sourceText: string, sourceLang: string, targetLang: string): string => {
    const encodedText = encodeURIComponent(sourceText);
    return `https://translate.google.com/?sl=${sourceLang}&tl=${targetLang}&text=${encodedText}&op=translate`;
  };

  // Open Google Translate in new tab
  const openGoogleTranslate = (text: string, sourceLang: string, targetLang: string) => {
    const url = generateGoogleTranslateUrl(text, sourceLang, targetLang);
    window.open(url, '_blank');
  };

  // Check if exercise is marked as favorite
  const isFavorite = (exercise: LanguageLearningExerciseModel): boolean => {
    return exercise.tags?.includes('favorite') || false;
  };

  // Check if exercise is marked for review
  const isMarkedForReview = (exercise: LanguageLearningExerciseModel): boolean => {
    return exercise.tags?.includes('review') || false;
  };

  // Toggle favorite status of current exercise
  const handleToggleFavorite = async () => {
    if (!currentExercise?.id || !window.languageLearningAPI) return;

    try {
      const currentTags = currentExercise.tags || [];
      const isCurrentlyFavorite = isFavorite(currentExercise);
      
      let updatedTags: string[];
      if (isCurrentlyFavorite) {
        // Remove favorite tag
        updatedTags = currentTags.filter(tag => tag !== 'favorite');
      } else {
        // Add favorite tag
        updatedTags = [...currentTags, 'favorite'];
      }

      const updatedExercise: LanguageLearningExerciseModel = {
        ...currentExercise,
        tags: updatedTags
      };

      const response = await window.languageLearningAPI.updateExercise(currentExercise.id, updatedExercise);
      
      if (response.success) {
        // Update current exercise
        setCurrentExercise(updatedExercise);
        
        // Update exercises list
        setAllExercises(prev => prev.map(ex => 
          ex.id === currentExercise.id ? updatedExercise : ex
        ));
        
        console.log(`Exercise ${isCurrentlyFavorite ? 'removed from' : 'added to'} favorites:`, currentExercise.id);
      } else {
        console.error('Failed to update favorite status:', response.error);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  // Toggle review status of current exercise
  const handleToggleReview = async () => {
    if (!currentExercise?.id || !window.languageLearningAPI) return;

    try {
      const currentTags = currentExercise.tags || [];
      const isCurrentlyMarkedForReview = isMarkedForReview(currentExercise);
      
      let updatedTags: string[];
      if (isCurrentlyMarkedForReview) {
        // Remove review tag
        updatedTags = currentTags.filter(tag => tag !== 'review');
      } else {
        // Add review tag
        updatedTags = [...currentTags, 'review'];
      }

      const updatedExercise: LanguageLearningExerciseModel = {
        ...currentExercise,
        tags: updatedTags
      };

      const response = await window.languageLearningAPI.updateExercise(currentExercise.id, updatedExercise);
      
      if (response.success) {
        // Update current exercise
        setCurrentExercise(updatedExercise);
        
        // Update exercises list
        setAllExercises(prev => prev.map(ex => 
          ex.id === currentExercise.id ? updatedExercise : ex
        ));
        
        console.log(`Exercise ${isCurrentlyMarkedForReview ? 'removed from' : 'marked for'} review:`, currentExercise.id);
      } else {
        console.error('Failed to update review status:', response.error);
      }
    } catch (error) {
      console.error('Error toggling review status:', error);
    }
  };

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
  const handleEditClick = (exercise?: LanguageLearningExerciseModel) => {
    const targetExercise = exercise || currentExercise;
    if (!targetExercise) return;
    
    setExerciseToEdit(targetExercise);
    setEditForm({
      practiceLanguageText: targetExercise.practiceLanguageText,
      nativeLanguageText: targetExercise.nativeLanguageText,
      practiceLanguage: targetExercise.practiceLanguage,
      nativeLanguage: targetExercise.nativeLanguage,
      difficulty: targetExercise.difficulty || ''
    });
    
    const exerciseTags = targetExercise.tags || [];
    setEditFormTags(exerciseTags);
    setEditFormNewTag('');
    loadTags(); // Load available tags
    openEditDialog();
  };

  // Handle edit form submission
  const handleEditSubmit = async () => {
    if (!exerciseToEdit?.id || !window.languageLearningAPI) return;

    setIsUpdating(true);
    try {
      const updatedExercise: LanguageLearningExerciseModel = {
        ...exerciseToEdit,
        practiceLanguageText: editForm.practiceLanguageText,
        nativeLanguageText: editForm.nativeLanguageText,
        practiceLanguage: editForm.practiceLanguage as 'en' | 'es' | 'fr',
        nativeLanguage: editForm.nativeLanguage as 'en' | 'es' | 'fr',
        difficulty: editForm.difficulty || undefined,
        wordCount: editForm.practiceLanguageText.split(/\s+/).filter(word => word.length > 0).length,
        tags: editFormTags // Add the tags from the form
      };

      const response = await window.languageLearningAPI.updateExercise(exerciseToEdit.id, updatedExercise);
      
      if (response.success) {
        // Update current exercise if it's the one being edited
        if (currentExercise?.id === exerciseToEdit.id) {
          setCurrentExercise(response.data || updatedExercise);
          // Reset exercise state with new text for current exercise
          resetExerciseState(updatedExercise.practiceLanguageText);
        }
        
        // Update exercises list
        setAllExercises(prev => prev.map(ex => 
          ex.id === exerciseToEdit.id ? updatedExercise : ex
        ));
        
        closeEditDialog();
        setExerciseToEdit(null);
        console.log('Exercise updated successfully:', exerciseToEdit.id);
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

  // Handle create exercise
  const handleCreateClick = () => {
    setCreateForm({
      practiceLanguageText: '',
      nativeLanguageText: '',
      practiceLanguage: '',
      nativeLanguage: '',
      difficulty: ''
    });
    
    setCreateFormTags([]);
    setCreateFormNewTag('');
    loadTags(); // Load available tags
    openCreateDialog();
  };

  // Handle create form submission
  const handleCreateSubmit = async () => {
    if (!window.languageLearningAPI) return;

    // Validate form
    if (!createForm.practiceLanguageText.trim() || !createForm.nativeLanguageText.trim()) {
      alert('Both practice and native language texts are required');
      return;
    }

    if (!createForm.practiceLanguage || !createForm.nativeLanguage) {
      alert('Both languages must be selected');
      return;
    }

    if (createForm.practiceLanguage === createForm.nativeLanguage) {
      alert('Practice and native languages must be different');
      return;
    }

    setIsCreating(true);
    try {
      const newExercise: Partial<LanguageLearningExerciseModel> = {
        practiceLanguageText: createForm.practiceLanguageText.trim(),
        nativeLanguageText: createForm.nativeLanguageText.trim(),
        practiceLanguage: createForm.practiceLanguage as 'en' | 'es' | 'fr',
        nativeLanguage: createForm.nativeLanguage as 'en' | 'es' | 'fr',
        difficulty: createForm.difficulty || undefined,
        wordCount: createForm.practiceLanguageText.trim().split(/\s+/).filter(word => word.length > 0).length,
        tags: [...createFormTags, 'manual-creation'],
        createdAt: Date.now(),
        practiceCount: 0,
        accuracyRate: 0,
        videoFileName: 'Manual Creation', // Indicate this was manually created
        videoFilePath: 'manual-creation', // Required field for saveExercise
        startTime: 0, // Required field for saveExercise - using 0 for manual exercises
        endTime: 1, // Required field for saveExercise - using 1 for manual exercises
        duration: 1 // Calculate duration based on start/end times
      };

      const response = await window.languageLearningAPI.saveExercise(newExercise);
      
      if (response.success && response.data) {
        // Add to exercises list
        const updatedExercises = [...allExercises, response.data];
        setAllExercises(updatedExercises);
        
        // If no current exercise, make this the current one
        if (!currentExercise) {
          setCurrentExercise(response.data);
          resetExerciseState(response.data.practiceLanguageText);
        }
        
        closeCreateDialog();
        console.log('Exercise created successfully:', response.data.id);
        alert('Exercise created successfully!');
      } else {
        console.error('Failed to create exercise:', response.error);
        alert('Failed to create exercise: ' + (response.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating exercise:', error);
      alert('Error creating exercise: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsCreating(false);
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

  // Function to identify and group duplicate exercises (memoized for performance)
  const getDuplicateGroups = useMemo(() => {
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
  }, [allExercises]);

  // Get unique video sources for filter dropdown (memoized)
  const uniqueVideoSources = useMemo(() => {
    const sources = [...new Set(allExercises.map(ex => ex.videoFileName).filter((name): name is string => Boolean(name)))];
    return sources.sort();
  }, [allExercises]);

  // Get unique tags for filter dropdown (memoized)
  const uniqueExerciseTags = useMemo(() => {
    const tagSet = new Set<string>();
    allExercises.forEach(exercise => {
      if (exercise.tags) {
        exercise.tags.forEach(tag => tagSet.add(tag));
      }
    });
    return Array.from(tagSet).sort();
  }, [allExercises]);

  // Filter exercises based on current filters (memoized)
  const filteredExercises = useMemo(() => {
    return allExercises.filter(exercise => {
      // Text search
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        const matchesText = 
          exercise.practiceLanguageText.toLowerCase().includes(searchLower) ||
          exercise.nativeLanguageText.toLowerCase().includes(searchLower) ||
          (exercise.videoFileName && exercise.videoFileName.toLowerCase().includes(searchLower));
        if (!matchesText) return false;
      }
      
      // Practice language filter
      if (filters.practiceLanguage !== 'all' && exercise.practiceLanguage !== filters.practiceLanguage) {
        return false;
      }
      
      // Native language filter
      if (filters.nativeLanguage !== 'all' && exercise.nativeLanguage !== filters.nativeLanguage) {
        return false;
      }
      
      // Difficulty filter
      if (filters.difficulty !== 'all' && exercise.difficulty !== filters.difficulty) {
        return false;
      }
      
      // Practice status filter
      if (filters.practiceStatus !== 'all') {
        switch (filters.practiceStatus) {
          case 'never':
            if (exercise.practiceCount && exercise.practiceCount > 0) return false;
            break;
          case 'low-accuracy':
            if (!exercise.accuracyRate || exercise.accuracyRate >= 70) return false;
            break;
          case 'high-accuracy':
            if (!exercise.accuracyRate || exercise.accuracyRate < 80) return false;
            break;
          case 'favorites':
            if (!isFavorite(exercise)) return false;
            break;
        }
      }
      
      // Video source filter
      if (filters.videoSource !== 'all' && exercise.videoFileName !== filters.videoSource) {
        return false;
      }
      
      // Tags filter
      if (filters.tags.length > 0) {
        if (!exercise.tags || !filters.tags.some(selectedTag => exercise.tags!.includes(selectedTag))) {
          return false;
        }
      }
      
      return true;
    });
  }, [allExercises, filters, isFavorite]);

  // Pagination calculations (memoized) - now works with filtered exercises
  const paginatedExercises = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredExercises.slice(startIndex, endIndex);
  }, [filteredExercises, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredExercises.length / pageSize);

  // Reset to first page when filters or exercises change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredExercises.length]);

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      searchText: '',
      practiceLanguage: 'all',
      nativeLanguage: 'all', 
      difficulty: 'all',
      practiceStatus: 'all',
      videoSource: 'all',
      tags: []
    });
  };

  // Check if any filters are active
  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === 'tags') {
      return Array.isArray(value) && value.length > 0;
    }
    return value !== 'all' && value !== '';
  });

  // Update individual filter
  const updateFilter = <K extends keyof typeof filters>(key: K, value: typeof filters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Load tags from database
  const loadTags = async () => {
    try {
      if (!window.tagAPI) {
        throw new Error('Tag API not available');
      }

      const response = await window.tagAPI.getAllTags();
      
      if (response.success && response.data) {
        setAllTags(response.data);
      } else {
        setAllTags([]);
      }
    } catch (err) {
      console.error('Error loading tags:', err);
      setTagError(err instanceof Error ? err.message : 'Failed to load tags');
      setAllTags([]);
    }
  };

  // Add a new tag
  const handleAddTag = async () => {
    if (!newTagInput.trim() || !window.tagAPI) return;

    setIsAddingTag(true);
    setTagError(null);
    
    try {
      const response = await window.tagAPI.addTag(newTagInput.trim());
      
      if (response.success) {
        setNewTagInput('');
        await loadTags(); // Refresh tags list
        console.log('Tag added successfully:', newTagInput.trim());
      } else {
        setTagError(response.error || 'Failed to add tag');
      }
    } catch (error) {
      console.error('Error adding tag:', error);
      setTagError(error instanceof Error ? error.message : 'Failed to add tag');
    } finally {
      setIsAddingTag(false);
    }
  };

  // Delete a tag
  const handleDeleteTag = async (tag: string) => {
    if (!window.tagAPI) return;

    setIsDeletingTag(tag);
    setTagError(null);
    
    try {
      const response = await window.tagAPI.deleteTag(tag);
      
      if (response.success) {
        await loadTags(); // Refresh tags list
        console.log('Tag deleted successfully:', tag);
      } else {
        setTagError(response.error || 'Failed to delete tag');
      }
    } catch (error) {
      console.error('Error deleting tag:', error);
      setTagError(error instanceof Error ? error.message : 'Failed to delete tag');
    } finally {
      setIsDeletingTag(null);
    }
  };

  // Open tag modal and load tags
  const handleOpenTagModal = () => {
    openTagModal();
    loadTags();
  };

  // Handle bulk duplicate removal
  const handleBulkRemoveDuplicates = async () => {
    if (!window.languageLearningAPI || getDuplicateGroups.length === 0) return;

    setIsBulkDeleting(true);
    try {
      let deletedCount = 0;
      const updatedExercises = [...allExercises];
      
      // For each duplicate group, keep the first one and delete the rest
      for (const [_, exercises] of getDuplicateGroups) {
        // Sort by creation date (keep the oldest one)
        const sortedExercises = exercises.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        
        // Delete all except the first (oldest) one
        for (let i = 1; i < sortedExercises.length; i++) {
          const exerciseToDelete = sortedExercises[i];
          if (exerciseToDelete.id) {
            try {
              const response = await window.languageLearningAPI.deleteExercise(exerciseToDelete.id);
              if (response.success) {
                // Remove from local state
                const index = updatedExercises.findIndex(ex => ex.id === exerciseToDelete.id);
                if (index > -1) {
                  updatedExercises.splice(index, 1);
                  deletedCount++;
                }
              } else {
                console.error('Failed to delete duplicate exercise:', exerciseToDelete.id, response.error);
              }
            } catch (error) {
              console.error('Error deleting duplicate exercise:', exerciseToDelete.id, error);
            }
          }
        }
      }
      
      // Update state with cleaned exercises
      setAllExercises(updatedExercises);
      
      // If current exercise was deleted, select a new one
      if (currentExercise && !updatedExercises.find(ex => ex.id === currentExercise.id)) {
        if (updatedExercises.length > 0) {
          selectNextExercise(updatedExercises);
        } else {
          setCurrentExercise(null);
          setError('No exercises remaining in database.');
        }
      }
      
      console.log(`Successfully removed ${deletedCount} duplicate exercises`);
      
    } catch (error) {
      console.error('Error during bulk duplicate removal:', error);
    } finally {
      setIsBulkDeleting(false);
      closeBulkDeleteDialog();
    }
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
          sx={{ mt: 1, mr: 2 }}
        >
          View All Exercises
        </Button>
        <Button
          variant="outlined"
          startIcon={<LocalOfferIcon />}
          onClick={handleOpenTagModal}
          sx={{ mt: 1, mr: 2 }}
        >
          Manage Tags
        </Button>
        <Button
          variant="outlined"
          startIcon={<AddCircleIcon />}
          onClick={handleCreateClick}
          sx={{ mt: 1 }}
        >
          Create Exercise
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
              {isFavorite(currentExercise) && (
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
              {/* Show current exercise tags for debugging */}
              {currentExercise.tags && currentExercise.tags.length > 0 && (
                <>
                  {currentExercise.tags.map((tag) => (
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
            
            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                onClick={handleToggleFavorite}
                variant="outlined"
                size="small"
                startIcon={isFavorite(currentExercise) ? <Star /> : <StarBorder />}
                sx={{ 
                  color: isFavorite(currentExercise) ? 'gold' : 'white', 
                  borderColor: isFavorite(currentExercise) ? 'gold' : 'white', 
                  '&:hover': { 
                    bgcolor: isFavorite(currentExercise) ? 'rgba(255,215,0,0.1)' : 'rgba(255,255,255,0.1)' 
                  } 
                }}
              >
                {isFavorite(currentExercise) ? 'Favorited' : 'Favorite'}
              </Button>
              <Button
                onClick={handleToggleReview}
                variant="outlined"
                size="small"
                startIcon={isMarkedForReview(currentExercise) ? <Bookmark /> : <BookmarkBorder />}
                sx={{ 
                  color: isMarkedForReview(currentExercise) ? 'lightblue' : 'white', 
                  borderColor: isMarkedForReview(currentExercise) ? 'lightblue' : 'white', 
                  '&:hover': { 
                    bgcolor: isMarkedForReview(currentExercise) ? 'rgba(173,216,230,0.1)' : 'rgba(255,255,255,0.1)' 
                  } 
                }}
              >
                Review
              </Button>
              <Button
                onClick={() => handleEditClick()}
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
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <CopyButton 
                    text={currentExercise.nativeLanguageText}
                    color="inherit"
                    sx={{ color: 'grey.400', '&:hover': { color: 'white' } }}
                  />
                  {showResult && (
                    <IconButton
                      onClick={() => openGoogleTranslate(
                        currentExercise.nativeLanguageText, 
                        currentExercise.nativeLanguage, 
                        currentExercise.practiceLanguage
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
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <CopyButton 
                      text={originalText}
                      color="inherit"
                      sx={{ color: 'white', opacity: 0.8, '&:hover': { opacity: 1 } }}
                    />
                    <IconButton
                      onClick={() => openGoogleTranslate(
                        originalText, 
                        currentExercise.practiceLanguage, 
                        currentExercise.nativeLanguage
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
              onChange={(_, isExpanded) => setIsDuplicatesSectionExpanded(isExpanded)}
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
                        e.stopPropagation(); // Prevent accordion from toggling
                        openBulkDeleteDialog();
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
                Showing {filteredExercises.length === 0 ? 0 : ((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, filteredExercises.length)} of {filteredExercises.length}
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
                      onClick={clearFilters}
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
                    onChange={(e) => updateFilter('searchText', e.target.value)}
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
                  
                  {/* Practice Language */}
                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel sx={{ color: 'grey.400' }}>Practice Lang</InputLabel>
                    <Select
                      value={filters.practiceLanguage}
                      onChange={(e) => updateFilter('practiceLanguage', e.target.value as any)}
                      sx={{ bgcolor: 'grey.800', '& fieldset': { borderColor: 'grey.600' } }}
                    >
                      <MenuItem value="all">All Languages</MenuItem>
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="es">Spanish</MenuItem>
                      <MenuItem value="fr">French</MenuItem>
                    </Select>
                  </FormControl>
                  
                  {/* Native Language */}
                  <FormControl size="small" sx={{ minWidth: 130 }}>
                    <InputLabel sx={{ color: 'grey.400' }}>Native Lang</InputLabel>
                    <Select
                      value={filters.nativeLanguage}
                      onChange={(e) => updateFilter('nativeLanguage', e.target.value as any)}
                      sx={{ bgcolor: 'grey.800', '& fieldset': { borderColor: 'grey.600' } }}
                    >
                      <MenuItem value="all">All Languages</MenuItem>
                      <MenuItem value="en">English</MenuItem>
                      <MenuItem value="es">Spanish</MenuItem>
                      <MenuItem value="fr">French</MenuItem>
                    </Select>
                  </FormControl>
                  
                  {/* Difficulty */}
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel sx={{ color: 'grey.400' }}>Difficulty</InputLabel>
                    <Select
                      value={filters.difficulty}
                      onChange={(e) => updateFilter('difficulty', e.target.value as any)}
                      sx={{ bgcolor: 'grey.800', '& fieldset': { borderColor: 'grey.600' } }}
                    >
                      <MenuItem value="all">All Levels</MenuItem>
                      <MenuItem value="easy">Easy</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="hard">Hard</MenuItem>
                    </Select>
                  </FormControl>
                  
                  {/* Practice Status */}
                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel sx={{ color: 'grey.400' }}>Status</InputLabel>
                    <Select
                      value={filters.practiceStatus}
                      onChange={(e) => updateFilter('practiceStatus', e.target.value as any)}
                      sx={{ bgcolor: 'grey.800', '& fieldset': { borderColor: 'grey.600' } }}
                    >
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="never">Never Practiced</MenuItem>
                      <MenuItem value="low-accuracy">Low Accuracy (&lt;70%)</MenuItem>
                      <MenuItem value="high-accuracy">High Accuracy (≥80%)</MenuItem>
                      <MenuItem value="favorites">⭐ Favorites</MenuItem>
                    </Select>
                  </FormControl>
                  
                  {/* Video Source */}
                  <FormControl size="small" sx={{ minWidth: 160 }}>
                    <InputLabel sx={{ color: 'grey.400' }}>Video Source</InputLabel>
                    <Select
                      value={filters.videoSource}
                      onChange={(e) => updateFilter('videoSource', e.target.value)}
                      sx={{ bgcolor: 'grey.800', '& fieldset': { borderColor: 'grey.600' } }}
                    >
                      <MenuItem value="all">All Videos</MenuItem>
                      {uniqueVideoSources.map(source => (
                        <MenuItem key={source} value={source}>
                          {source.length > 25 ? `${source.substring(0, 25)}...` : source}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  {/* Tags */}
                  <FormControl size="small" sx={{ minWidth: 160 }}>
                    <InputLabel sx={{ color: 'grey.400' }}>Tags</InputLabel>
                    <Select
                      multiple
                      value={filters.tags}
                      onChange={(e) => updateFilter('tags', e.target.value as string[])}
                      sx={{ bgcolor: 'grey.800', '& fieldset': { borderColor: 'grey.600' } }}
                      renderValue={(selected) => {
                        if (selected.length === 0) {
                          return 'All Tags';
                        }
                        if (selected.length === 1) {
                          return selected[0];
                        }
                        return `${selected.length} tags`;
                      }}
                    >
                      {uniqueExerciseTags.map(tag => (
                        <MenuItem key={tag} value={tag}>
                          <Checkbox checked={filters.tags.indexOf(tag) > -1} />
                          <ListItemText primary={tag} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </CardContent>
            </Card>
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
                  {filteredExercises.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          {hasActiveFilters ? 'No exercises match your filters' : 'No exercises found'}
                        </Typography>
                        {hasActiveFilters && (
                          <Button 
                            size="small" 
                            onClick={clearFilters}
                            sx={{ mt: 1 }}
                          >
                            Clear Filters
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedExercises.map((exercise, index) => (
                      <TableRow key={exercise.id || index}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {exercise.practiceLanguageText}
                            </Typography>
                            {isFavorite(exercise) && (
                              <Star sx={{ fontSize: 16, color: 'gold' }} />
                            )}
                          </Box>
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
                          <Typography variant="caption">
                            {new Date(exercise.createdAt).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton 
                              onClick={() => handleEditClick(exercise)}
                              color="primary"
                              size="small"
                              sx={{ '&:hover': { bgcolor: 'primary.dark' } }}
                              title="Edit exercise"
                            >
                              <Edit />
                            </IconButton>
                            <IconButton 
                              onClick={() => handleDeleteClick(exercise)}
                              color="error"
                              size="small"
                              sx={{ '&:hover': { bgcolor: 'error.dark' } }}
                              title="Delete exercise"
                            >
                              <Delete />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <Stack direction="row" justifyContent="center" alignItems="center" sx={{ mt: 3 }}>
                <Pagination 
                  count={totalPages}
                  page={currentPage}
                  onChange={(_, page) => setCurrentPage(page)}
                  color="primary"
                  size="large"
                  showFirstButton
                  showLastButton
                />
              </Stack>
            )}
          </Box>
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

      {/* Bulk Delete Duplicates Confirmation Dialog */}
      <Dialog
        open={isBulkDeleteDialogOpen}
        onClose={closeBulkDeleteDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Delete color="error" />
          Remove All Duplicate Exercises
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Are you sure you want to remove all duplicate exercises? This action cannot be undone.
          </Typography>
          
          <Card sx={{ mb: 2, bgcolor: 'warning.50', border: '1px solid', borderColor: 'warning.200' }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="h6" color="warning.main" sx={{ mb: 1 }}>
                What will happen:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • {getDuplicateGroups.length} duplicate groups will be processed<br/>
                • {getDuplicateGroups.reduce((sum, [_, exercises]) => sum + exercises.length - 1, 0)} exercises will be deleted<br/>
                • {getDuplicateGroups.length} exercises will remain (the oldest copy of each)<br/>
                • {allExercises.length - getDuplicateGroups.reduce((sum, [_, exercises]) => sum + exercises.length - 1, 0)} total exercises will remain
              </Typography>
            </CardContent>
          </Card>
          
          <Typography variant="body2" color="text.secondary">
            The oldest exercise from each duplicate group will be kept based on creation date.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={closeBulkDeleteDialog} 
            color="primary"
            disabled={isBulkDeleting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleBulkRemoveDuplicates} 
            color="error" 
            variant="contained"
            disabled={isBulkDeleting}
            startIcon={isBulkDeleting ? <CircularProgress size={16} /> : <Delete />}
          >
            {isBulkDeleting ? 'Removing Duplicates...' : 'Remove All Duplicates'}
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
            
            {/* Tags Management */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocalOfferIcon /> Exercise Tags
              </Typography>
              
              {/* Current Tags */}
              {editFormTags.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Current Tags:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {editFormTags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        onDelete={() => {
                          const newTags = editFormTags.filter(t => t !== tag);
                          setEditFormTags(newTags);
                        }}
                        deleteIcon={<Delete />}
                        variant="outlined"
                        color="primary"
                        sx={{
                          '& .MuiChip-deleteIcon': {
                            color: 'error.main',
                            '&:hover': {
                              color: 'error.dark'
                            }
                          }
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
              
              {/* Add New Tag */}
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', mb: 2 }}>
                <TextField
                  label="Add Tag"
                  value={editFormNewTag}
                  onChange={(e) => setEditFormNewTag(e.target.value)}
                  placeholder="Enter tag name..."
                  size="small"
                  fullWidth
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const tagName = editFormNewTag.trim().toLowerCase();
                      if (tagName && !editFormTags.includes(tagName)) {
                        const newTags = [...editFormTags, tagName];
                        setEditFormTags(newTags);
                        setEditFormNewTag('');
                      }
                    }
                  }}
                />
                <Button
                  onClick={() => {
                    const tagName = editFormNewTag.trim().toLowerCase();
                    if (tagName && !editFormTags.includes(tagName)) {
                      const newTags = [...editFormTags, tagName];
                      setEditFormTags(newTags);
                      setEditFormNewTag('');
                    }
                  }}
                  disabled={!editFormNewTag.trim() || editFormTags.includes(editFormNewTag.trim().toLowerCase())}
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
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Quick Add from Existing Tags:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, maxHeight: 120, overflowY: 'auto', p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                    {allTags
                      .filter(tag => !editFormTags.includes(tag))
                      .map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          onClick={() => {
                            if (!editFormTags.includes(tag)) {
                              const newTags = [...editFormTags, tag];
                              setEditFormTags(newTags);
                            }
                          }}
                          variant="outlined"
                          color="default"
                          sx={{ 
                            cursor: 'pointer',
                            '&:hover': {
                              bgcolor: 'primary.light',
                              color: 'white'
                            }
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
            onClick={() => {
              if (exerciseToEdit) {
                closeEditDialog();
                setExerciseToEdit(null);
                handleDeleteClick(exerciseToEdit);
              }
            }}
            color="error"
            startIcon={<Delete />}
            sx={{ mr: 'auto' }}
          >
            Delete
          </Button>
          <Button 
            onClick={() => {
              closeEditDialog();
              setExerciseToEdit(null);
            }} 
            color="primary"
          >
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

      {/* Create Exercise Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onClose={closeCreateDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Exercise</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
            {/* Practice Language Text */}
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Practice Language Text"
              value={createForm.practiceLanguageText}
              onChange={(e) => setCreateForm({...createForm, practiceLanguageText: e.target.value})}
              placeholder="Text that users will practice arranging"
              required
            />

            {/* Native Language Text */}
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Native Language Text (Reference)"
              value={createForm.nativeLanguageText}
              onChange={(e) => setCreateForm({...createForm, nativeLanguageText: e.target.value})}
              placeholder="Reference text shown to help users"
              required
            />

            {/* Languages */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth required>
                <InputLabel>Practice Language</InputLabel>
                <Select
                  value={createForm.practiceLanguage}
                  label="Practice Language"
                  onChange={(e) => setCreateForm({...createForm, practiceLanguage: e.target.value as 'en' | 'es' | 'fr'})}
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="es">Spanish</MenuItem>
                  <MenuItem value="fr">French</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel>Native Language</InputLabel>
                <Select
                  value={createForm.nativeLanguage}
                  label="Native Language"
                  onChange={(e) => setCreateForm({...createForm, nativeLanguage: e.target.value as 'en' | 'es' | 'fr'})}
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="es">Spanish</MenuItem>
                  <MenuItem value="fr">French</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Difficulty */}
            <FormControl fullWidth>
              <InputLabel>Difficulty (Optional)</InputLabel>
              <Select
                value={createForm.difficulty}
                label="Difficulty (Optional)"
                onChange={(e) => setCreateForm({...createForm, difficulty: e.target.value as 'easy' | 'medium' | 'hard'})}
              >
                <MenuItem value="">Not Set</MenuItem>
                <MenuItem value="easy">Easy</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="hard">Hard</MenuItem>
              </Select>
            </FormControl>

            {/* Tags Management */}
            <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocalOfferIcon />
                Exercise Tags
              </Typography>

              {/* Current Tags */}
              {createFormTags.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Current Tags:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {createFormTags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        onDelete={() => setCreateFormTags(prev => prev.filter(t => t !== tag))}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Add New Tag */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Add Tag"
                  value={createFormNewTag}
                  onChange={(e) => setCreateFormNewTag(e.target.value)}
                  placeholder="Enter tag name..."
                />
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    const tagName = createFormNewTag.trim().toLowerCase();
                    if (tagName && !createFormTags.includes(tagName)) {
                      setCreateFormTags(prev => [...prev, tagName]);
                      setCreateFormNewTag('');
                    }
                  }}
                  disabled={!createFormNewTag.trim() || createFormTags.includes(createFormNewTag.trim().toLowerCase())}
                >
                  Add
                </Button>
              </Box>

              {/* Existing Tags - Quick Add */}
              {allTags.length > 0 && (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Quick Add from Existing:
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: 0.5, 
                    maxHeight: 120, 
                    overflowY: 'auto',
                    p: 1,
                    bgcolor: 'background.default',
                    borderRadius: 1
                  }}>
                    {allTags
                      .filter(tag => !createFormTags.includes(tag))
                      .map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        onClick={() => setCreateFormTags(prev => [...prev, tag])}
                        variant="outlined"
                        size="small"
                        sx={{ cursor: 'pointer' }}
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
            onClick={closeCreateDialog}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateSubmit} 
            color="primary" 
            variant="contained"
            disabled={isCreating || !createForm.practiceLanguageText.trim() || !createForm.nativeLanguageText.trim() || !createForm.practiceLanguage || !createForm.nativeLanguage}
          >
            {isCreating ? 'Creating...' : 'Create Exercise'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Tag Management Modal */}
      <AppModal
        open={isTagModalOpen}
        onClose={closeTagModal}
        title="Manage Tags"
        maxWidth="sm"
        fullWidth
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create and manage tags for organizing exercises. Tags are unique strings that help categorize content.
          </Typography>

          {/* Add New Tag */}
          <Card sx={{ mb: 3, bgcolor: 'grey.50' }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AddIcon /> Add New Tag
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <TextField
                  label="Tag Name"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  placeholder="Enter tag name..."
                  size="small"
                  fullWidth
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddTag();
                    }
                  }}
                  disabled={isAddingTag}
                  error={!!tagError}
                />
                <Button
                  onClick={handleAddTag}
                  disabled={!newTagInput.trim() || isAddingTag}
                  variant="contained"
                  startIcon={isAddingTag ? <CircularProgress size={16} /> : <AddIcon />}
                  sx={{ minWidth: 100 }}
                >
                  {isAddingTag ? 'Adding...' : 'Add'}
                </Button>
              </Box>
              
              {tagError && (
                <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                  {tagError}
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Existing Tags */}
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Existing Tags ({allTags.length})
            </Typography>
            
            {allTags.length === 0 ? (
              <Card sx={{ bgcolor: 'grey.100' }}>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <LocalOfferIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    No tags created yet. Add your first tag above to get started.
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {allTags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleDeleteTag(tag)}
                    deleteIcon={
                      isDeletingTag === tag ? (
                        <CircularProgress size={16} />
                      ) : (
                        <Delete />
                      )
                    }
                    disabled={isDeletingTag === tag}
                    variant="outlined"
                    color="primary"
                    sx={{
                      '& .MuiChip-deleteIcon': {
                        color: isDeletingTag === tag ? 'primary.main' : 'error.main',
                        '&:hover': {
                          color: 'error.dark'
                        }
                      }
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>

          {/* Instructions */}
          <Card sx={{ mt: 3, bgcolor: 'info.50', border: '1px solid', borderColor: 'info.200' }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="caption" color="info.main" sx={{ fontWeight: 'medium' }}>
                💡 Instructions:
              </Typography>
              <Typography variant="body2" color="info.dark" sx={{ mt: 1 }}>
                • Tags must be unique (case-insensitive)
                • Use simple, descriptive names
                • To modify a tag, delete it and create a new one
                • Tags help organize and filter exercises
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </AppModal>
    </Box>
  );
};