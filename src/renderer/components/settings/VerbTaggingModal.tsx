import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  LinearProgress,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
} from "@mui/material";
import { Close, Stop as StopIcon } from "@mui/icons-material";

interface VerbTaggingModalProps {
  open: boolean;
  onClose: () => void;
  progress: any;
  onStop: () => void;
}

const VerbTaggingModal: React.FC<VerbTaggingModalProps> = ({ open, onClose, progress, onStop }) => {
  const handleStop = async () => {
    await window.verbTaggingAPI.stop();
    onStop();
  };

  const isRunning = progress?.status === "running";
  const isDone = progress?.status === "completed" || progress?.status === "stopping";
  const hasError = progress?.status === "error";
  const percent = progress && progress.total > 0
    ? (progress.current / progress.total) * 100
    : 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="h6">Verb Tagging Progress</Typography>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {!progress || progress.status === "idle" ? (
          <Typography color="text.secondary">Loading progress...</Typography>
        ) : (
          <Box className="flex flex-col gap-4 mt-2">
            {/* Status */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Chip
                label={
                  progress.status === "running"
                    ? "Running"
                    : progress.status === "completed"
                    ? "Completed"
                    : progress.status === "stopping"
                    ? "Stopped"
                    : progress.status === "error"
                    ? "Error"
                    : "Idle"
                }
                color={
                  progress.status === "running"
                    ? "primary"
                    : progress.status === "completed"
                    ? "success"
                    : progress.status === "stopping"
                    ? "warning"
                    : progress.status === "error"
                    ? "error"
                    : "default"
                }
                size="small"
              />
              {hasError && progress.error && (
                <Typography variant="body2" color="error">
                  {progress.error}
                </Typography>
              )}
            </Box>

            {/* Progress bar and count */}
            <Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography variant="body2">
                  {progress.current} out of {progress.total}
                </Typography>
                <Typography variant="body2">
                  {percent.toFixed(1)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={percent}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Box>

            {/* Updated words */}
            {progress.updatedWords.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Updated Words ({progress.updatedWords.length})
                </Typography>
                <TableContainer component={Paper} sx={{ maxHeight: 200 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Word</TableCell>
                        <TableCell>Translation</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {progress.updatedWords.map((w: { word: string; translation: string; id: string }) => (
                        <TableRow key={w.id}>
                          <TableCell>{w.word}</TableCell>
                          <TableCell>{w.translation}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* Created words (new parent verbs) */}
            {progress.createdWords.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom color="success.main">
                  New Verbs Created ({progress.createdWords.length})
                </Typography>
                <TableContainer component={Paper} sx={{ maxHeight: 200 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Verb</TableCell>
                        <TableCell>Translation</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {progress.createdWords.map((w: { word: string; translation: string }, idx: number) => (
                        <TableRow key={`${w.word}-${idx}`}>
                          <TableCell>{w.word}</TableCell>
                          <TableCell>{w.translation}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        {isRunning && (
          <Button
            variant="contained"
            color="error"
            startIcon={<StopIcon />}
            onClick={handleStop}
          >
            Stop
          </Button>
        )}
        <Button onClick={onClose} variant="outlined">
          {isDone ? "Close" : "Minimize"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export { VerbTaggingModal };