import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
  Box,
} from "@mui/material";

interface SubtitleTimingModalProps {
  open: boolean;
  onClose: () => void;
  subtitleFilePath: string | null;
  onTimingAdjusted: () => void;
}

export const SubtitleTimingModal: React.FC<SubtitleTimingModalProps> = ({
  open,
  onClose,
  subtitleFilePath,
  onTimingAdjusted,
}) => {
  const [milliseconds, setMilliseconds] = useState<string>("1000");
  const [direction, setDirection] = useState<"increase" | "decrease">("increase");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!subtitleFilePath) {
      setError("No subtitle file selected");
      return;
    }

    const ms = parseInt(milliseconds, 10);
    if (isNaN(ms) || ms <= 0) {
      setError("Please enter a valid positive number");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      await window.fileManagerAPI.adjustSubtitleTiming({
        vttFilePath: subtitleFilePath,
        adjustmentMs: ms,
        increase: direction === "increase",
      });
      
      onTimingAdjusted();
      onClose();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to adjust subtitle timing");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      resetForm();
      onClose();
    }
  };

  const resetForm = () => {
    setMilliseconds("1000");
    setDirection("increase");
    setError(null);
  };

  const handleMillisecondsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    // Only allow numbers
    if (/^\d*$/.test(value)) {
      setMilliseconds(value);
      setError(null);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        style: {
          backgroundColor: "#1a1a1a",
          color: "white",
        },
      }}
    >
      <DialogTitle>
        Adjust Subtitle Timing
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <TextField
            fullWidth
            label="Milliseconds"
            value={milliseconds}
            onChange={handleMillisecondsChange}
            placeholder="Enter milliseconds (e.g., 1000)"
            variant="outlined"
            margin="normal"
            inputProps={{
              pattern: "[0-9]*",
              inputMode: "numeric",
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#444",
                },
                "&:hover fieldset": {
                  borderColor: "#666",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#1976d2",
                },
                "& input": {
                  color: "white",
                },
              },
              "& .MuiInputLabel-root": {
                color: "#aaa",
                "&.Mui-focused": {
                  color: "#1976d2",
                },
              },
            }}
          />

          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Direction
            </Typography>
            <RadioGroup
              value={direction}
              onChange={(e) => setDirection(e.target.value as "increase" | "decrease")}
              row
            >
              <FormControlLabel
                value="increase"
                control={<Radio sx={{ color: "#aaa", "&.Mui-checked": { color: "#1976d2" } }} />}
                label="Increase (delay subtitles)"
                sx={{ 
                  color: "white !important",
                  "& .MuiFormControlLabel-label": { color: "white !important" }
                }}
              />
              <FormControlLabel
                value="decrease"
                control={<Radio sx={{ color: "#aaa", "&.Mui-checked": { color: "#1976d2" } }} />}
                label="Decrease (advance subtitles)"
                sx={{ 
                  color: "white !important",
                  "& .MuiFormControlLabel-label": { color: "white !important" } 
                }}
              />
            </RadioGroup>
          </Box>

          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}

          <Typography variant="body2" sx={{ mt: 2, color: "white" }}>
            Current subtitle file: {subtitleFilePath ? subtitleFilePath.split(/[/\\]/).pop() : "None"}
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button 
          onClick={handleClose} 
          disabled={isProcessing}
          sx={{ color: "#aaa" }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isProcessing || !subtitleFilePath}
          variant="contained"
          sx={{
            backgroundColor: "#1976d2",
            "&:hover": {
              backgroundColor: "#1565c0",
            },
            "&:disabled": {
              backgroundColor: "#333",
            },
          }}
        >
          {isProcessing ? "Adjusting..." : "Apply"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};