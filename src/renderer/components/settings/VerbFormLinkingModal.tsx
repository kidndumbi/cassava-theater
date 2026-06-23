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

interface VerbFormLinkingModalProps {
  open: boolean;
  onClose: () => void;
  progress: any;
  onStop: () => void;
}

const VerbFormLinkingModal: React.FC<VerbFormLinkingModalProps> = ({ open, onClose, progress, onStop }) => {
  const handleStop = async () => {
    await window.verbFormLinkingAPI.stop();
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
        <Typography variant="h6">Verb Form Linking Progress</Typography>
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

            {/* Linked words */}
            {progress.linkedWords.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Linked Forms ({progress.linkedWords.length})
                </Typography>
                <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell>Form (Conjugated)</TableCell>
                        <TableCell>→ Infinitive</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {progress.linkedWords.map((item: { formWord: string; infinitiveWord: string; formId: string; infinitiveId: string }) => (
                        <TableRow key={item.formId}>
                          <TableCell>{item.formWord}</TableCell>
                          <TableCell>→ {item.infinitiveWord}</TableCell>
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

export { VerbFormLinkingModal };