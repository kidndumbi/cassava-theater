import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  CircularProgress,
  Divider,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  Edit as EditIcon,
} from "@mui/icons-material";

interface PracticeLogDetails {
  isCorrect: boolean;
  userAnswer: string;
  correctAnswer: string;
  nativeText: string;
}

interface ExerciseUpdateDetails {
  changedFields: string[];
  before: Record<string, any>;
  after: Record<string, any>;
}

interface ExerciseLogEntry {
  id: string;
  exerciseId: string;
  timestamp: number;
  type: "practice" | "exercise-update";
  practiceDetails?: PracticeLogDetails;
  updateDetails?: ExerciseUpdateDetails;
}

interface ExerciseLogs {
  exerciseId: string;
  entries: ExerciseLogEntry[];
}

interface ExerciseLogsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseId: string | null;
}

function formatFieldValue(value: any): string {
  if (Array.isArray(value)) return value.join(", ") || "(none)";
  if (value === null || value === undefined || value === "") return "(empty)";
  return String(value);
}

function formatTimestamp(ts: number): string {
  return new Date(ts).toLocaleString();
}

export const ExerciseLogsDialog: React.FC<ExerciseLogsDialogProps> = ({
  isOpen,
  onClose,
  exerciseId,
}) => {
  const [entries, setEntries] = useState<ExerciseLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && exerciseId && window.languageLearningAPI?.getExerciseLogs) {
      setIsLoading(true);
      setError(null);
      window.languageLearningAPI
        .getExerciseLogs(exerciseId)
        .then((response) => {
          setIsLoading(false);
          if (response.success && response.data) {
            const logs = response.data as ExerciseLogs;
            const sorted = [...logs.entries].sort(
              (a, b) => b.timestamp - a.timestamp,
            );
            setEntries(sorted);
          } else {
            setError(response.error ?? "Failed to load logs");
          }
        })
        .catch((err: any) => {
          setIsLoading(false);
          setError(err?.message ?? "Failed to load logs");
        });
    }
    if (!isOpen) {
      setEntries([]);
      setError(null);
    }
  }, [isOpen, exerciseId]);

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Exercise Logs</DialogTitle>
      <DialogContent>
        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        )}
        {error && (
          <Typography color="error" sx={{ py: 2 }}>
            {error}
          </Typography>
        )}
        {!isLoading && !error && entries.length === 0 && (
          <Typography color="text.secondary" sx={{ py: 2, textAlign: "center" }}>
            No logs yet for this exercise.
          </Typography>
        )}
        {!isLoading &&
          entries.map((entry, i) => (
            <Box key={entry.id}>
              {i > 0 && <Divider sx={{ my: 1.5 }} />}
              <Box sx={{ py: 1 }}>
                {/* Header row */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 1,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    {formatTimestamp(entry.timestamp)}
                  </Typography>
                  {entry.type === "practice" ? (
                    <Chip
                      size="small"
                      icon={
                        entry.practiceDetails?.isCorrect ? (
                          <CheckCircle />
                        ) : (
                          <Cancel />
                        )
                      }
                      label={
                        entry.practiceDetails?.isCorrect ? "Correct" : "Wrong"
                      }
                      color={
                        entry.practiceDetails?.isCorrect ? "success" : "error"
                      }
                      variant="outlined"
                      sx={{ height: 20, fontSize: "0.65rem" }}
                    />
                  ) : (
                    <Chip
                      size="small"
                      icon={<EditIcon />}
                      label="Updated"
                      color="primary"
                      variant="outlined"
                      sx={{ height: 20, fontSize: "0.65rem" }}
                    />
                  )}
                </Box>

                {/* Practice details */}
                {entry.type === "practice" && entry.practiceDetails && (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 0.5,
                      fontSize: "0.85rem",
                    }}
                  >
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
                      >
                        Your answer
                      </Typography>
                      <Typography
                        variant="body2"
                        color={
                          entry.practiceDetails.isCorrect
                            ? "success.main"
                            : "error.main"
                        }
                      >
                        {entry.practiceDetails.userAnswer}
                      </Typography>
                    </Box>
                    {!entry.practiceDetails.isCorrect && (
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            textTransform: "uppercase",
                            letterSpacing: 0.5,
                          }}
                        >
                          Correct answer
                        </Typography>
                        <Typography variant="body2">
                          {entry.practiceDetails.correctAnswer}
                        </Typography>
                      </Box>
                    )}
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
                      >
                        Native
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {entry.practiceDetails.nativeText}
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* Update details */}
                {entry.type === "exercise-update" && entry.updateDetails && (() => {
                  const updateDetails = entry.updateDetails;
                  return (
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                          display: "block",
                          mb: 0.5,
                        }}
                      >
                        Changed: {updateDetails.changedFields.join(", ")}
                      </Typography>
                      {updateDetails.changedFields.map((field) => (
                        <Box
                          key={field}
                          sx={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: 1,
                            mt: 0.5,
                          }}
                        >
                          <Box
                            sx={{
                              p: 0.75,
                              borderRadius: 1,
                              bgcolor: "error.light",
                              opacity: 0.85,
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="error.dark"
                              sx={{ display: "block" }}
                            >
                              {field} (before)
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ wordBreak: "break-word" }}
                            >
                              {formatFieldValue(updateDetails.before[field])}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              p: 0.75,
                              borderRadius: 1,
                              bgcolor: "success.light",
                              opacity: 0.85,
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="success.dark"
                              sx={{ display: "block" }}
                            >
                              {field} (after)
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ wordBreak: "break-word" }}
                            >
                              {formatFieldValue(updateDetails.after[field])}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  );
                })()}
              </Box>
            </Box>
          ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
