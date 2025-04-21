import { Box } from "@mui/material";
import { useMp4Conversion } from "../../hooks/useMp4Conversion";
import { Mp4ConversionProgress } from "../../store/mp4Conversion/mp4Conversion.slice";
import React, { useState } from "react";
import { useConfirmation } from "../../contexts/ConfirmationContext";
import { ProgressItem } from "./ProgressItem";
import { Mp4ProgressListActions } from "./Mp4ProgressListActions";

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
      selectedItems.map((item) => removeFromConversionQueue(item.fromPath)),
    );
  };

  const handleBulkPause = async (selectedItems: Mp4ConversionProgress[]) => {
    await Promise.all(
      selectedItems
        .filter((item) => !item.paused)
        .map((item) => pauseConversionItem(item.fromPath)),
    );
  };

  const handleBulkResume = async (selectedItems: Mp4ConversionProgress[]) => {
    await Promise.all(
      selectedItems
        .filter((item) => item.paused)
        .map((item) => unpauseConversionItem(item.fromPath)),
    );
  };

  // Sort so that the currently converting item (percent > 0 and < COMPLETION_THRESHOLD) is at the top
  const sortedProgressList = React.useMemo(() => {
    return [...progressList].sort((a, b) => {
      const aIsConverting = a.percent > 0 && a.percent < COMPLETION_THRESHOLD;
      const bIsConverting = b.percent > 0 && b.percent < COMPLETION_THRESHOLD;
      if (aIsConverting && !bIsConverting) return -1;
      if (!aIsConverting && bIsConverting) return 1;
      return 0;
    });
  }, [progressList]);

  if (progressList.length === 0) {
    return null;
  }

  return (
    <Box className="ml-14 mr-14 mt-4">
      <Mp4ProgressListActions
        clearCompletedConversions={clearCompletedConversions}
        selected={selected}
        setSelected={setSelected}
        progressList={sortedProgressList}
        bulkRemoveFromQueue={handleBulkRemove}
        bulkPause={handleBulkPause}
        bulkResume={handleBulkResume}
      />
      <Box className="mt-2 flex flex-col gap-2">
        {sortedProgressList.map((progress, index) => (
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
