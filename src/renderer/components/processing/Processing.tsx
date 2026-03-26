import { Box } from "@mui/material";
import { YoutubeDownloadQueueItem } from "../../../main/services/youtube.service";
import { Mp4ProgressList } from "../mp4ConversionUI/Mp4ProgressList";
import { SubtitleProgressList } from "../subtitleGenerationUI/SubtitleProgressList";
import { SubtitleSyncProgressList } from "../subtitleSyncUI/SubtitleSyncProgressList";
import { YoutubeDownloadProgressList } from "../youtubeDownloadUI/YoutubeDownloadProgressList";
import { AppListPanel } from "../common/AppListPanel";
import { useState } from "react";
import { ConversionQueueItem } from "../../../models/conversion-queue-item.model";
import { SubtitleGenerationQueueItem } from "../../../models/subtitle-generation-queue-item.model";
import { SubtitleSyncQueueItem } from "../../../models/subtitle-sync-queue-item.model";

export const Processing = ({
  youtubeDownloadProgressList,
  mp4ConversionProgress,
  subtitleGenerationProgress,
  subtitleSyncProgress,
  toolToShow = "mp4-conversion",
}: {
  youtubeDownloadProgressList: YoutubeDownloadQueueItem[];
  mp4ConversionProgress: ConversionQueueItem[];
  subtitleGenerationProgress: SubtitleGenerationQueueItem[];
  subtitleSyncProgress: SubtitleSyncQueueItem[];
  toolToShow?: string;
}) => {
  const listItems = [
    { id: "youtube-download", name: "Youtube Download" },
    { id: "mp4-conversion", name: "MP4 Conversion" },
    { id: "subtitle-generation", name: "Subtitle Generation" },
    { id: "subtitle-sync", name: "Subtitle Sync" },
  ];

  const [selectedListItem, setSelectedListItem] = useState<{
    id: string;
    name: string;
  } | null>(listItems.find((item) => item.id === toolToShow) || listItems[0]);

  const getView = (id: string) => {
    switch (id) {
      case "youtube-download":
        return (
          <YoutubeDownloadProgressList
            progressList={youtubeDownloadProgressList}
          />
        );
      case "mp4-conversion":
        return (
          <Mp4ProgressList mp4ConversionProgress={mp4ConversionProgress} />
        );
      case "subtitle-generation":
        return (
          <SubtitleProgressList subtitleGenerationProgress={subtitleGenerationProgress} />
        );
      case "subtitle-sync":
        return (
          <SubtitleSyncProgressList subtitleSyncProgress={subtitleSyncProgress} />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Box className="custom-scrollbar ml-5 mr-5 overflow-y-auto pt-5">
        <Box display="flex" gap={2} mt={2}>
          <AppListPanel
            items={listItems}
            selectedItem={selectedListItem}
            setSelectedItem={(tool) => {
              setSelectedListItem(tool);
            }}
          />
          <Box sx={{ width: "100%" }}>{getView(selectedListItem?.id)}</Box>
        </Box>
      </Box>
    </>
  );
};
