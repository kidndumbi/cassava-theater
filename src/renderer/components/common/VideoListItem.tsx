import React from "react";
import { Box, Avatar } from "@mui/material";
import theme from "../../theme";
import { VideoDataModel } from "../../../models/videoData.model";
import { removeVidExt } from "../../util/helperFunctions";
import { VideoProgressBar } from "./VideoProgressBar";

interface VideoListItemProps {
  video: VideoDataModel;
  getImageUrl: (video: VideoDataModel) => string | undefined;
  onClick: (video: VideoDataModel) => void;
}

export const VideoListItem: React.FC<VideoListItemProps> = ({
  video,
  getImageUrl,
  onClick,
}) => (
  <Box
    className="flex cursor-pointer gap-1"
    onClick={() => onClick(video)}
  >
    <Avatar
      variant="rounded"
      src={getImageUrl(video)}
      alt={video.fileName || ""}
      sx={{ width: 80, height: 80 }}
    />
    <Box
      className="flex min-w-0 flex-1 flex-col gap-1 rounded p-1"
      sx={{
        backgroundColor: theme.customVariables.appDark,
        color: theme.customVariables.appWhiteSmoke,
      }}
    >
      <Box
        className="overflow-hidden text-ellipsis whitespace-nowrap text-base font-semibold"
        sx={{
          color: theme.customVariables.appWhiteSmoke,
        }}
        title={video.fileName}
      >
        {removeVidExt(video.fileName)}
      </Box>
      <Box
        className="overflow-hidden text-ellipsis whitespace-nowrap text-sm"
        sx={{
          color: theme.palette.primary.light,
        }}
        title={video.fileName}
      >
        {video.filePath}
      </Box>
      {typeof video.currentTime === "number" &&
        typeof video.duration === "number" &&
        video.currentTime > 0 && (
          <VideoProgressBar
            current={video.currentTime}
            total={video.duration}
          />
        )}
    </Box>
  </Box>
);
