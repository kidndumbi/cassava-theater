import { Box, Typography } from "@mui/material";
import React from "react";
import { VideoDataModel } from "../../../models/videoData.model";
import { hasExtension } from "../../util/helperFunctions";
import FolderIcon from "@mui/icons-material/Folder";

interface CustomFolderDataListProps {
  customFolderData: VideoDataModel[];
  handlePosterClick: ( videoPath: string) => void;
  getImageUrl: (path: string) => string;
  defaultImageUrl: string;
}

const CustomFolderDataList: React.FC<CustomFolderDataListProps> = ({
  handlePosterClick,
  getImageUrl,
  customFolderData,
  defaultImageUrl
}) => {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.style.display = "none";
    const nextSibling = e.currentTarget.nextElementSibling as HTMLElement;
    if (nextSibling) {
      nextSibling.style.display = "block";
    }
  };

  const renderPosterImage = (item: VideoDataModel) => (
    <img
      src={
        item?.movie_details?.poster_path
          ? getImageUrl(item.movie_details.poster_path)
          : defaultImageUrl
      }
      alt={item.fileName}
      style={{
        width: "100%",
        height: "auto",
        borderRadius: "10px",
        cursor: "pointer",
      }}
      onClick={() => handlePosterClick(item.filePath!)}
      onError={handleImageError}
    />
  );

  const renderFolderIcon = (item: VideoDataModel) => (
    !hasExtension(item.fileName!) && (
      <Box position="absolute" top="4px" right="4px">
        <FolderIcon color="primary" />
      </Box>
    )
  );

  return (
    <Box display="flex" flexWrap="wrap" gap="4px">
      {customFolderData.map((item, idx) => (
        <Box key={idx} m={1} flex="1 1 200px" maxWidth="200px">
          <Box position="relative">
            {renderPosterImage(item)}
            {renderFolderIcon(item)}
          </Box>
          <Typography
            variant="subtitle1"
            align="center"
            sx={{ wordBreak: "break-all" }}
          >
            {item.fileName!.replace(/\.(mp4|mkv)$/i, "")}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

export { CustomFolderDataList };
