import React, { useEffect, useState, useMemo } from "react";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import { School, Refresh } from "@mui/icons-material";
import { LanguageLearningExerciseModel } from "../../../models/language-learning-exercise.model";
import { useModalState } from "../../hooks/useModalState";
import { LanguagePracticeHeader } from "./LanguagePracticeHeader";
import { ExerciseCard } from "./ExerciseCard";
import { ExerciseListModal } from "./ExerciseListModal";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import { EditExerciseDialog } from "./EditExerciseDialog";
import { CreateExerciseDialog } from "./CreateExerciseDialog";
import { TagManagementModal } from "./TagManagementModal";
import { BulkDeleteDialog } from "./BulkDeleteDialog";

export const LanguagePracticePage: React.FC = () => {
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
      practiceLanguage: 'es',
      nativeLanguage: 'en',
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
      // Check if practiceLanguageText exists before calling trim()
      if (!exercise.practiceLanguageText) return;
      
      const key = exercise.practiceLanguageText.trim().toLowerCase();
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(exercise);
    });
    
    // Return only groups with more than one exercise (duplicates)
    return Object.entries(groups).filter(([, exercises]) => exercises.length > 1);
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
          (typeof exercise.practiceLanguageText === 'string' && exercise.practiceLanguageText.toLowerCase().includes(searchLower)) ||
          (typeof exercise.nativeLanguageText === 'string' && exercise.nativeLanguageText.toLowerCase().includes(searchLower)) ||
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
        if (!exercise.tags || !filters.tags.some(selectedTag => exercise.tags?.includes(selectedTag))) {
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
      for (const [, exercises] of getDuplicateGroups) {
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

  return (
    <Box
      sx={{
        maxWidth: 1000,
        margin: "0 auto",
        padding: 3,
        minHeight: "100vh",
      }}
    >
      <LanguagePracticeHeader
        totalExercises={allExercises.length}
        onOpenExercisesList={openExercisesList}
        onOpenTagModal={handleOpenTagModal}
        onCreateExercise={handleCreateClick}
      />

      <ExerciseCard
        exercise={currentExercise}
        scrambledWords={scrambledWords}
        selectedWords={selectedWords}
        originalText={originalText}
        showResult={showResult}
        isCorrect={isCorrect}
        exerciseCompleted={exerciseCompleted}
        isFavorite={isFavorite(currentExercise)}
        isMarkedForReview={isMarkedForReview(currentExercise)}
        onWordClick={handleWordClick}
        onRemoveWord={handleRemoveWord}
        onSubmit={handleSubmit}
        onReset={handleReset}
        onNext={handleNext}
        onToggleFavorite={handleToggleFavorite}
        onToggleReview={handleToggleReview}
        onEdit={() => handleEditClick()}
        onOpenGoogleTranslate={openGoogleTranslate}
      />

      {/* Exercise Source Info */}
      {currentExercise?.videoFileName && (
        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: 'white' }}>
          From: {currentExercise.videoFileName}
        </Typography>
      )}

      <ExerciseListModal
        isOpen={isExercisesListOpen}
        onClose={closeExercisesList}
        allExercises={allExercises}
        filteredExercises={filteredExercises}
        paginatedExercises={paginatedExercises}
        currentExercise={currentExercise}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        getDuplicateGroups={getDuplicateGroups}
        isDuplicatesSectionExpanded={isDuplicatesSectionExpanded}
        isBulkDeleting={isBulkDeleting}
        hasActiveFilters={hasActiveFilters}
        filters={filters}
        uniqueVideoSources={uniqueVideoSources}
        uniqueExerciseTags={uniqueExerciseTags}
        isFavorite={isFavorite}
        onSetCurrentPage={setCurrentPage}
        onSetDuplicatesSectionExpanded={setIsDuplicatesSectionExpanded}
        onBulkDeleteClick={openBulkDeleteDialog}
        onSelectExercise={(exercise) => {
          setCurrentExercise(exercise);
          resetExerciseState(exercise.practiceLanguageText);
          closeExercisesList();
        }}
        onEditExercise={handleEditClick}
        onDeleteExercise={handleDeleteClick}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onUpdateFilter={updateFilter as any}
        onClearFilters={clearFilters}
      />

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleConfirmDelete}
        exercise={exerciseToDelete}
      />

      <BulkDeleteDialog
        isOpen={isBulkDeleteDialogOpen}
        onClose={closeBulkDeleteDialog}
        onConfirm={handleBulkRemoveDuplicates}
        isBulkDeleting={isBulkDeleting}
        duplicateCount={getDuplicateGroups.reduce((sum, [, exercises]) => sum + exercises.length, 0)}
        duplicateGroupsCount={getDuplicateGroups.length}
      />

      <EditExerciseDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          closeEditDialog();
          setExerciseToEdit(null);
        }}
        onSubmit={handleEditSubmit}
        onDelete={() => {
          if (exerciseToEdit) {
            closeEditDialog();
            setExerciseToEdit(null);
            handleDeleteClick(exerciseToEdit);
          }
        }}
        exercise={exerciseToEdit}
        form={editForm}
        onFormChange={(field, value) => setEditForm(prev => ({ ...prev, [field]: value }))}
        tags={editFormTags}
        newTag={editFormNewTag}
        onTagsChange={setEditFormTags}
        onNewTagChange={setEditFormNewTag}
        allTags={allTags}
        isUpdating={isUpdating}
      />

      <CreateExerciseDialog
        isOpen={isCreateDialogOpen}
        onClose={closeCreateDialog}
        onSubmit={handleCreateSubmit}
        form={createForm}
        onFormChange={(field, value) => setCreateForm(prev => ({ ...prev, [field]: value }))}
        tags={createFormTags}
        newTag={createFormNewTag}
        onTagsChange={setCreateFormTags}
        onNewTagChange={setCreateFormNewTag}
        allTags={allTags}
        isCreating={isCreating}
      />

      <TagManagementModal
        isOpen={isTagModalOpen}
        onClose={closeTagModal}
        allTags={allTags}
        newTagInput={newTagInput}
        onNewTagInputChange={setNewTagInput}
        onAddTag={handleAddTag}
        onDeleteTag={handleDeleteTag}
        isAddingTag={isAddingTag}
        isDeletingTag={isDeletingTag}
        tagError={tagError}
      />
    </Box>
  );
};