import { Box, Button, Checkbox, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import theme from "../../theme";
import { CircularProgressWithLabel } from "../common/CircularProgressWithLabel";
import { Mp4ConversionProgress } from "../../store/mp4Conversion/mp4Conversion.slice";

interface ProgressItemProps {
  progress: Mp4ConversionProgress;
  pauseConversion: (path: string) => Promise<boolean>;
  unpauseConversion: (path: string) => Promise<boolean>;
  removeFromConversionQueue: (path: string) => Promise<boolean>;
  currentlyProcessingItem: Mp4ConversionProgress;
  checked: boolean;
  onCheck: (checked: boolean) => void;
}

const COMPLETION_THRESHOLD = 100;

export const ProgressItem = ({
  progress,
  pauseConversion,
  unpauseConversion,
  currentlyProcessingItem,
  removeFromConversionQueue,
  checked,
  onCheck,
}: ProgressItemProps) => {
  const isSelectable =
    currentlyProcessingItem?.fromPath !== progress.fromPath &&
    progress.percent < COMPLETION_THRESHOLD &&
    !progress.complete;

  return (
    <Box
      className="flex place-content-between items-center rounded-md p-1"
      sx={{
        backgroundColor: theme.customVariables.appDark,
      }}
    >
      <Box className="flex items-center gap-2">
        <Box sx={{ width: 40, display: "flex", justifyContent: "center" }}>
          {isSelectable ? (
            <Checkbox
              checked={checked}
              onChange={(e) => onCheck(e.target.checked)}
              sx={{
                marginRight: 1,
                color: theme.palette.primary.main,
              }}
            />
          ) : null}
        </Box>
        <FilePathText path={progress.toPath} />
      </Box>

      <Box className="flex gap-2" sx={{ alignItems: "center" }}>
        {isSelectable && (
          <>
            {!progress.paused ? (
              <Button
                size="small"
                variant="contained"
                onClick={() => pauseConversion(progress.fromPath)}
                sx={{ alignSelf: "center" }}
              >
                Pause
              </Button>
            ) : (
              <Button
                size="small"
                variant="outlined"
                onClick={() => unpauseConversion(progress.fromPath)}
                sx={{ alignSelf: "center" }}
              >
                Resume
              </Button>
            )}
          </>
        )}

        {!progress.complete && (
          <Button
            size="small"
            variant="contained"
            color="error"
            onClick={() => removeFromConversionQueue(progress.fromPath)}
            sx={{ alignSelf: "center" }}
          >
            Cancel
          </Button>
        )}

        {progress.percent > 0 &&
        progress.percent < COMPLETION_THRESHOLD &&
        !progress.complete ? (
          <CircularProgressWithLabel value={progress.percent} />
        ) : progress.complete ? (
          <CheckCircleIcon
            sx={{
              color: theme.palette.primary.main,
            }}
          />
        ) : null}
      </Box>
    </Box>
  );
};

const FilePathText = ({ path }: { path: string }) => (
  <Typography
    variant="body2"
    sx={{
      color: theme.customVariables.appWhiteSmoke,
      marginRight: "10px",
    }}
    component="div"
  >
    {path}
  </Typography>
);
