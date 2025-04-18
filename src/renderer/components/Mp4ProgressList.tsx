import { Box, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import theme from "../theme";
import { CircularProgressWithLabel } from "./common/CircularProgressWithLabel";
import AppIconButton from "./common/AppIconButton";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { useMp4Conversion } from "../hooks/useMp4Conversion";
import { Mp4ConversionProgress } from "../store/mp4Conversion/mp4Conversion.slice";
import Button from "@mui/material/Button";

interface Mp4ProgressListProps {
  progressList: Mp4ConversionProgress[];
}

const COMPLETION_THRESHOLD = 100;

export const Mp4ProgressList = ({
  progressList = [],
}: Mp4ProgressListProps) => {
  const {
    pauseConversionItem,
    unpauseConversionItem,
    currentlyProcessingItem,
    clearCompletedConversions,
  } = useMp4Conversion();

  if (progressList.length === 0) {
    return null;
  }

  return (
    <>
      <Box className="ml-14 mr-14 mt-4">
        <Box>
          <Button
            variant="outlined"
            onClick={() => {
              console.log("Clearing completed items");
              clearCompletedConversions();
            }}
          >
            Clear completed
          </Button>
        </Box>
        <Box className="mt-2 flex flex-col gap-2">
          {progressList.map((progress, index) => (
            <ProgressItem
              key={index}
              progress={progress}
              pauseConversion={(path) => pauseConversionItem(path)}
              unpauseConversion={(path) => unpauseConversionItem(path)}
              currentlyProcessingItem={currentlyProcessingItem}
            />
          ))}
        </Box>
      </Box>
    </>
  );
};

const ProgressItem = ({
  progress,
  pauseConversion,
  unpauseConversion,
  currentlyProcessingItem,
}: {
  progress: Mp4ConversionProgress;
  pauseConversion: (path: string) => Promise<boolean>;
  unpauseConversion: (path: string) => Promise<boolean>;
  currentlyProcessingItem: Mp4ConversionProgress;
}) => (
  <Box
    className="flex place-content-between items-center rounded-md p-3"
    sx={{
      backgroundColor: theme.palette.secondary.main,
    }}
  >
    <FilePathText path={progress.toPath} />
    <Box className="flex">
      {currentlyProcessingItem?.fromPath !== progress.fromPath &&
        progress.percent < COMPLETION_THRESHOLD && (
          <>
            {!progress.paused ? (
              <AppIconButton
                tooltip="Pause conversion"
                onClick={() => pauseConversion(progress.fromPath)}
              >
                <PauseIcon></PauseIcon>
              </AppIconButton>
            ) : (
              <AppIconButton
                tooltip="resume conversion"
                onClick={() => unpauseConversion(progress.fromPath)}
              >
                <PlayArrowIcon></PlayArrowIcon>
              </AppIconButton>
            )}
          </>
        )}

      <ProgressIndicator percent={progress.percent} />
    </Box>
  </Box>
);

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

const ProgressIndicator = ({ percent }: { percent: number }) => {
  if (percent === COMPLETION_THRESHOLD) {
    return (
      <CheckCircleIcon
        sx={{
          color: theme.palette.primary.main,
        }}
      />
    );
  }
  return <CircularProgressWithLabel value={percent} />;
};
