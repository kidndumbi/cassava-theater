import { Box, Typography } from "@mui/material";
import React from "react";
import { VideoDataModel } from "../../../models/videoData.model";
import { getUrl, hasExtension } from "../../util/helperFunctions";
import FolderIcon from "@mui/icons-material/Folder";
import { PosterCard } from "../common/PosterCard";
import { useSettings } from "../../hooks/useSettings";

interface CustomFolderDataListProps {
  customFolderData: VideoDataModel[];
  handlePosterClick: (videoPath: string) => void;
  getImageUrl: (path: string) => string;
}

const CustomFolderDataList: React.FC<CustomFolderDataListProps> = ({
  handlePosterClick,
  getImageUrl,
  customFolderData,
}) => {
  const { settings } = useSettings();

  const getImageUlr = (movie: VideoDataModel) => {
    if (movie.poster?.trim()) {
      return getUrl("file", movie.poster, null, settings?.port);
    }
    if (movie?.movie_details?.poster_path) {
      return getImageUrl(movie.movie_details.poster_path);
    }
  };

  const renderPosterImage = (item: VideoDataModel) => (
    <>
      <PosterCard
        imageUrl={getImageUlr(item)}
        altText={item.fileName}
        onClick={() => item.filePath && handlePosterClick(item.filePath)}
        footer={renderFolderIcon(item)}
      ></PosterCard>
    </>
  );

  const renderFolderIcon = (item: VideoDataModel) =>
    item.fileName &&
    !hasExtension(item.fileName) && (
      <Box className="absolute top-1 right-1">
        <FolderIcon color="primary" />
      </Box>
    );

  return (
    <Box className="flex flex-wrap gap-1">
      {customFolderData.map((item, idx) => (
        <Box key={idx} className="m-1 flex-[1_1_200px] max-w-[200px]">
          <Box className="relative">{renderPosterImage(item)}</Box>
          <Typography
            variant="subtitle1"
            align="center"
            className="break-all"
          >
            {(item.fileName ?? "").replace(/\.(mp4|mkv|avi)$/i, "")}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export { CustomFolderDataList };
