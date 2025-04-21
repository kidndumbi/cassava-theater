import { Box, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import theme from "../theme";
import { CircularProgressWithLabel } from "./common/CircularProgressWithLabel";
import { useMp4Conversion } from "../hooks/useMp4Conversion";
import { Mp4ConversionProgress } from "../store/mp4Conversion/mp4Conversion.slice";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import React, { useState } from "react";
import { useConfirmation } from "../contexts/ConfirmationContext";

interface Mp4ProgressListProps {
  progressList: Mp4ConversionProgress[];
}

const COMPLETION_THRESHOLD = 100;

const ActionButton = ({
  children,
  disabled,
  color,
  onClick,
}: {
  children: React.ReactNode;
  disabled: boolean;
  color?: "error" | "primary" | "secondary";
  onClick: () => void;
}) => (
  <Button
    variant="contained"
    color={color}
    disabled={disabled}
    sx={{
      "&.Mui-disabled": {
        color: theme.customVariables.appWhiteSmoke,
        backgroundColor: "grey",
      },
    }}
    onClick={onClick}
  >
    {children}
  </Button>
);

export const Mp4ProgressList = ({
  progressList = [],
}: Mp4ProgressListProps) => {
  const {
    pauseConversionItem,
    unpauseConversionItem,
    currentlyProcessingItem,
    clearCompletedConversions,
    removeFromConversionQueue,
  } = useMp4Conversion();

  const { openDialog, setMessage } = useConfirmation();

  const [selected, setSelected] = useState<string[]>([]);

  const handleSelect = (fromPath: string, checked: boolean) => {
    setSelected((prev) =>
      checked ? [...prev, fromPath] : prev.filter((p) => p !== fromPath),
    );
  };

  const handleBulkRemove = async (selectedItems: Mp4ConversionProgress[]) => {
    setMessage("Are you want to cancel?");
    const dialogDecision = await openDialog();
    if (dialogDecision !== "Ok") return;

    await Promise.all(
      selectedItems.map(item => removeFromConversionQueue(item.fromPath))
    );
  };

  const handleBulkPause = async (selectedItems: Mp4ConversionProgress[]) => {
    await Promise.all(
      selectedItems
        .filter(item => !item.paused)
        .map(item => pauseConversionItem(item.fromPath))
    );
  };

  const handleBulkResume = async (selectedItems: Mp4ConversionProgress[]) => {
    await Promise.all(
      selectedItems
        .filter(item => item.paused)
        .map(item => unpauseConversionItem(item.fromPath))
    );
  };

  if (progressList.length === 0) {
    return null;
  }

  return (
    <Box className="ml-14 mr-14 mt-4">
      <Mp4ProgressListActions
        clearCompletedConversions={clearCompletedConversions}
        selected={selected}
        progressList={progressList}
        bulkRemoveFromQueue={handleBulkRemove}
        bulkPause={handleBulkPause}
        bulkResume={handleBulkResume}
      />
      <Box className="mt-2 flex flex-col gap-2">
        {progressList.map((progress, index) => (
          <ProgressItem
            key={index}
            progress={progress}
            pauseConversion={pauseConversionItem}
            unpauseConversion={unpauseConversionItem}
            currentlyProcessingItem={currentlyProcessingItem}
            removeFromConversionQueue={async (path) => {
              setMessage("Are you want to cancel?");
              const dialogDecision = await openDialog();
              if (dialogDecision === "Ok") {
                return removeFromConversionQueue(path);
              }
            }}
            checked={selected.includes(progress.fromPath)}
            onCheck={(checked) => handleSelect(progress.fromPath, checked)}
          />
        ))}
      </Box>
    </Box>
  );
};

interface Mp4ProgressListActionsProps {
  clearCompletedConversions: () => void;
  selected: string[];
  progressList: Mp4ConversionProgress[];
  bulkRemoveFromQueue: (selectedItems: Mp4ConversionProgress[]) => void;
  bulkPause: (selectedItems: Mp4ConversionProgress[]) => void;
  bulkResume: (selectedItems: Mp4ConversionProgress[]) => void;
}

const Mp4ProgressListActions = ({
  clearCompletedConversions,
  selected,
  progressList,
  bulkRemoveFromQueue,
  bulkPause,
  bulkResume,
}: Mp4ProgressListActionsProps) => {
  const selectedItems = progressList.filter((item) =>
    selected.includes(item.fromPath),
  );

  const anyPaused = selectedItems.some(item => item.paused);

  return (
    <Box className="flex justify-between">
      <Box className="flex gap-2">
        <ActionButton
          disabled={selected.length === 0}
          onClick={async () => {
            await bulkPause(selectedItems);
          }}
        >
          Pause
        </ActionButton>
        <ActionButton
          disabled={selected.length === 0 || !anyPaused}
          onClick={() => {
            bulkResume(selectedItems);
          }}
        >
          Resume
        </ActionButton>
        <ActionButton
          color="error"
          disabled={selected.length === 0}
          onClick={() => {
            bulkRemoveFromQueue(selectedItems);
          }}
        >
          Cancel
        </ActionButton>
      </Box>
      <Box>
        <Button
          variant="contained"
          onClick={clearCompletedConversions}
        >
          Clear completed
        </Button>
      </Box>
    </Box>
  );
};

interface ProgressItemProps {
  progress: Mp4ConversionProgress;
  pauseConversion: (path: string) => Promise<boolean>;
  unpauseConversion: (path: string) => Promise<boolean>;
  removeFromConversionQueue: (path: string) => Promise<boolean>;
  currentlyProcessingItem: Mp4ConversionProgress;
  checked: boolean;
  onCheck: (checked: boolean) => void;
}

const ProgressItem = ({
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
    progress.percent < COMPLETION_THRESHOLD;

  return (
    <Box
      className="flex place-content-between items-center rounded-md p-3"
      sx={{
        backgroundColor: theme.palette.secondary.main,
      }}
    >
      <Box className="flex items-center gap-2">
        <Box sx={{ width: 40, display: "flex", justifyContent: "center" }}>
          {isSelectable ? (
            <Checkbox
              checked={checked}
              onChange={(e) => onCheck(e.target.checked)}
              sx={{ marginRight: 1 }}
            />
          ) : null}
        </Box>
        <FilePathText path={progress.toPath} />
      </Box>

      <Box className="flex gap-2">
        {isSelectable && (
          <>
            {!progress.paused ? (
              <Button
                size="small"
                variant="contained"
                onClick={() => pauseConversion(progress.fromPath)}
              >
                Pause
              </Button>
            ) : (
              <Button
                size="small"
                variant="outlined"
                onClick={() => unpauseConversion(progress.fromPath)}
              >
                Resume
              </Button>
            )}
          </>
        )}

        {progress.percent < COMPLETION_THRESHOLD && (
          <Button
            size="small"
            variant="contained"
            color="error"
            onClick={() => removeFromConversionQueue(progress.fromPath)}
          >
            Cancel
          </Button>
        )}

        <ProgressIndicator percent={progress.percent} />
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
