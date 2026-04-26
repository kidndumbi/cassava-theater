import React from "react";
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  Chip,
  CircularProgress
} from "@mui/material";
import { Add as AddIcon, Delete, LocalOffer as LocalOfferIcon } from "@mui/icons-material";
import { AppModal } from "../common/AppModal";

interface TagManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  allTags: string[];
  newTagInput: string;
  onNewTagInputChange: (value: string) => void;
  onAddTag: () => void;
  onDeleteTag: (tag: string) => void;
  isAddingTag: boolean;
  isDeletingTag: string | null;
  tagError: string | null;
}

export const TagManagementModal: React.FC<TagManagementModalProps> = ({
  isOpen,
  onClose,
  allTags,
  newTagInput,
  onNewTagInputChange,
  onAddTag,
  onDeleteTag,
  isAddingTag,
  isDeletingTag,
  tagError,
}) => {
  return (
    <AppModal
      open={isOpen}
      onClose={onClose}
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
                onChange={(e) => onNewTagInputChange(e.target.value)}
                placeholder="Enter tag name..."
                size="small"
                fullWidth
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    onAddTag();
                  }
                }}
                disabled={isAddingTag}
                error={!!tagError}
              />
              <Button
                onClick={onAddTag}
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
                  onDelete={() => onDeleteTag(tag)}
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
              • Tags must be unique (case-insensitive)<br />
              • Use simple, descriptive names<br />
              • To modify a tag, delete it and create a new one<br />
              • Tags help organize and filter exercises
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </AppModal>
  );
};