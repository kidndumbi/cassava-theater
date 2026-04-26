import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Card, CardContent, CircularProgress, Box } from "@mui/material";
import { Delete, Warning } from "@mui/icons-material";

interface BulkDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isBulkDeleting: boolean;
  duplicateCount: number;
  duplicateGroupsCount: number;
}

export const BulkDeleteDialog: React.FC<BulkDeleteDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isBulkDeleting,
  duplicateCount,
  duplicateGroupsCount,
}) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
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
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Warning color="warning" />
              <Typography variant="subtitle2" color="warning.dark">
                Summary of Changes
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              • {duplicateGroupsCount} duplicate groups found<br />
              • {duplicateCount} duplicate exercises will be removed<br />
              • The oldest exercise from each group will be kept
            </Typography>
          </CardContent>
        </Card>
        
        <Typography variant="body2" color="text.secondary">
          The oldest exercise from each duplicate group will be kept based on creation date.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onClose} 
          color="primary"
          disabled={isBulkDeleting}
        >
          Cancel
        </Button>
        <Button 
          onClick={onConfirm} 
          color="error" 
          variant="contained"
          disabled={isBulkDeleting}
          startIcon={isBulkDeleting ? <CircularProgress size={16} /> : <Delete />}
        >
          {isBulkDeleting ? 'Removing...' : 'Remove All Duplicates'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};