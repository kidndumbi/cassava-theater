import { Box } from "@mui/material";
import { YoutubeDownloadQueueItem } from "../../../main/services/youtube.service";
import { Mp4ConversionProgress } from "../../store/mp4Conversion/mp4Conversion.slice";
import { Mp4ProgressList } from "../mp4ConversionUI/Mp4ProgressList";
import { YoutubeDownloadProgressList } from "../youtubeDownloadUI/YoutubeDownloadProgressList";
import { AppListPanel } from "../common/AppListPanel";
import { useState } from "react";

export const Processing = ({
  progressList,
  youtubeDownloadProgressList,
}: {
  progressList: Mp4ConversionProgress[];
  youtubeDownloadProgressList: YoutubeDownloadQueueItem[];
}) => {
  const listItems = [
    { id: "youtube-download", name: "Youtube Download" },
    { id: "mp4-conversion", name: "MP4 Conversion" },
  ];

  const [selectedListItem, setSelectedListItem] = useState<{
    id: string;
    name: string;
  } | null>(listItems[0]);

  const getView = (id: string) => {
    switch (id) {
      case "youtube-download":
        return (
          <YoutubeDownloadProgressList
            progressList={youtubeDownloadProgressList}
          />
        );
      case "mp4-conversion":
        return <Mp4ProgressList progressList={progressList} />;
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
