import { Box, Button, useTheme } from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import React from "react";
import { AppButton } from "../common/AppButton";
import { Mp4ConversionProgress } from "../../store/mp4Conversion/mp4Conversion.slice";

export interface Mp4ProgressListActionsProps {
  clearCompletedConversions: () => void;
  selected: string[];
  setSelected: React.Dispatch<React.SetStateAction<string[]>>;
  progressList: Mp4ConversionProgress[];
  bulkRemoveFromQueue: (selectedItems: Mp4ConversionProgress[]) => void;
  bulkPause: (selectedItems: Mp4ConversionProgress[]) => void;
  bulkResume: (selectedItems: Mp4ConversionProgress[]) => void;
}

const COMPLETION_THRESHOLD = 100;

export const Mp4ProgressListActions = ({
  clearCompletedConversions,
  selected,
  setSelected,
  progressList,
  bulkRemoveFromQueue,
  bulkPause,
  bulkResume,
}: Mp4ProgressListActionsProps) => {
  const theme = useTheme();

  const selectedItems = progressList.filter((item) =>
    selected.includes(item.fromPath),
  );

  const anyPaused = selectedItems.some((item) => item.paused);

  const selectableItems = progressList.filter(
    (item) => !item.complete,
  );
  const allSelected =
    selectableItems.length > 0 &&
    selectableItems.every((item) => selected.includes(item.fromPath));
  const someSelected =
    selectableItems.some((item) => selected.includes(item.fromPath)) &&
    !allSelected;

  return (
    <Box className="flex justify-between">
      <Box className="flex gap-2">
        <Box>
          <Checkbox
            checked={allSelected}
            indeterminate={someSelected}
            onChange={(e) => {
              if (e.target.checked) {
                setSelected(selectableItems.map((item) => item.fromPath));
              } else {
                setSelected([]);
              }
            }}
            sx={{ marginRight: 1, color: theme.palette.primary.main }}
          />
        </Box>
        <AppButton
          disabled={selected.length === 0}
          onClick={async () => {
            await bulkPause(selectedItems);
          }}
        >
          Pause
        </AppButton>
        <AppButton
          disabled={selected.length === 0 || !anyPaused}
          onClick={() => {
            bulkResume(selectedItems);
          }}
        >
          Resume
        </AppButton>
        <AppButton
          color="error"
          disabled={selected.length === 0}
          onClick={() => {
            bulkRemoveFromQueue(selectedItems);
          }}
        >
          Cancel
        </AppButton>
      </Box>
      <Box>
        <Button variant="contained" onClick={clearCompletedConversions}>
          Clear completed
        </Button>
      </Box>
    </Box>
  );
};
