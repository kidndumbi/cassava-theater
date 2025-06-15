import { Box, Button, Checkbox, Typography } from "@mui/material";
import theme from "../../theme";
import { ConversionQueueItem } from "../../../models/conversion-queue-item.model";
import { CircularProgressWithLabel } from "../common/CircularProgressWithLabel";

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

const ProgressCheckbox = () => (
  <Checkbox
    checked={false}
    onChange={(e) => console.log(e.target.checked)}
    sx={{
      marginRight: 1,
      color: theme.palette.primary.main,
    }}
  />
);

export const Mp4ProgressListItem = ({
  progress,
  onPause,
  onResume,
  onCancel,
}: {
  progress: ConversionQueueItem;
  onPause: (inputPath: string) => void;
  onResume: (inputPath: string) => void;
  onCancel: (id: string) => void;
}) => {
  const isProcessing = progress.status === "processing";
  return (
    <Box
      className="flex place-content-between items-center rounded-md p-1"
      sx={{
        backgroundColor: theme.customVariables.appDark,
      }}
    >
      <Box className="flex items-center gap-2">
        <Box sx={{ width: 40, display: "flex", justifyContent: "center" }}>
          {!isProcessing && <ProgressCheckbox />}
        </Box>
        <FilePathText path={progress.outputPath} />
      </Box>
      <Box className="flex gap-2" sx={{ alignItems: "center" }}>
        {!isProcessing &&
          (progress.paused ? (
            <Button
              size="small"
              variant="outlined"
              onClick={() => onResume(progress.id)}
              sx={{ alignSelf: "center" }}
            >
              Resume
            </Button>
          ) : (
            <Button
              size="small"
              variant="contained"
              onClick={() => onPause(progress.id)}
              sx={{ alignSelf: "center" }}
            >
              Pause
            </Button>
          ))}
        <Button
          size="small"
          variant="contained"
          color="error"
          onClick={() => onCancel(progress.id)}
          sx={{ alignSelf: "center" }}
        >
          Cancel
        </Button>
        {isProcessing && <CircularProgressWithLabel value={progress.percent} />}
      </Box>
    </Box>
  );
};
