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
  Chip
} from "@mui/material";
import { Add as AddIcon, LocalOffer as LocalOfferIcon } from "@mui/icons-material";

interface CreateExerciseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  form: {
    practiceLanguageText: string;
    nativeLanguageText: string;
    practiceLanguage: 'en' | 'es' | 'fr' | '';
    nativeLanguage: 'en' | 'es' | 'fr' | '';
    difficulty: 'easy' | 'medium' | 'hard' | '';
  };
  onFormChange: <K extends keyof typeof form>(field: K, value: typeof form[K]) => void;
  tags: string[];
  newTag: string;
  onTagsChange: (tags: string[]) => void;
  onNewTagChange: (tag: string) => void;
  allTags: string[];
  isCreating: boolean;
}

export const CreateExerciseDialog: React.FC<CreateExerciseDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  form,
  onFormChange,
  tags,
  newTag,
  onTagsChange,
  onNewTagChange,
  allTags,
  isCreating,
}) => {
  const addTag = () => {
    const tagName = newTag.trim().toLowerCase();
    if (tagName && !tags.includes(tagName)) {
      onTagsChange([...tags, tagName]);
      onNewTagChange('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  const addExistingTag = (tag: string) => {
    if (!tags.includes(tag)) {
      onTagsChange([...tags, tag]);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
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
            value={form.practiceLanguageText}
            onChange={(e) => onFormChange('practiceLanguageText', e.target.value)}
            placeholder="Text that users will practice arranging"
            required
          />

          {/* Native Language Text */}
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Native Language Text (Reference)"
            value={form.nativeLanguageText}
            onChange={(e) => onFormChange('nativeLanguageText', e.target.value)}
            placeholder="Reference text shown to help users"
            required
          />

          {/* Languages */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Practice Language</InputLabel>
              <Select
                value={form.practiceLanguage}
                label="Practice Language"
                onChange={(e) => onFormChange('practiceLanguage', e.target.value as 'en' | 'es' | 'fr')}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="es">Spanish</MenuItem>
                <MenuItem value="fr">French</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Native Language</InputLabel>
              <Select
                value={form.nativeLanguage}
                label="Native Language"
                onChange={(e) => onFormChange('nativeLanguage', e.target.value as 'en' | 'es' | 'fr')}
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
              value={form.difficulty}
              label="Difficulty (Optional)"
              onChange={(e) => onFormChange('difficulty', e.target.value as 'easy' | 'medium' | 'hard')}
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
            {tags.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Current Tags:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onDelete={() => removeTag(tag)}
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
                value={newTag}
                onChange={(e) => onNewTagChange(e.target.value)}
                placeholder="Enter tag name..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addTag();
                  }
                }}
              />
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addTag}
                disabled={!newTag.trim() || tags.includes(newTag.trim().toLowerCase())}
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
                    .filter(tag => !tags.includes(tag))
                    .map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      onClick={() => addExistingTag(tag)}
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
          onClick={onClose}
          disabled={isCreating}
        >
          Cancel
        </Button>
        <Button 
          onClick={onSubmit} 
          color="primary" 
          variant="contained"
          disabled={isCreating || !form.practiceLanguageText.trim() || !form.nativeLanguageText.trim() || !form.practiceLanguage || !form.nativeLanguage}
        >
          {isCreating ? 'Creating...' : 'Create Exercise'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};