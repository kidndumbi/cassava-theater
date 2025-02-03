import React, { useEffect, useState } from "react";
import { VideoDataModel } from "../../../models/videoData.model";
import { Box, useTheme, Button, Breadcrumbs, Typography } from "@mui/material";
import { SearchHeader } from "../common/SearchHeader";
import LoadingIndicator from "../common/LoadingIndicator";
import { useTmdbImageUrl } from "../../hooks/useImageUrl";
import { useNavigate } from "react-router-dom";
import { CustomFolderModel } from "../../../models/custom-folder";
import { CustomFolderDataList } from "./CustomFolderDataList";
import { hasExtension } from "../../util/helperFunctions";

interface CustomFolderProps {
  customFolderData: VideoDataModel[];
  loadingCustomFolderData: boolean;
  refreshCustomFolderData: (path: string) => void;
  style?: React.CSSProperties;
  customFolder: CustomFolderModel | null;
  menuId: string;
}

const CustomFolder: React.FC<CustomFolderProps> = ({
  style,
  customFolderData,
  loadingCustomFolderData,
  refreshCustomFolderData,
  customFolder,
  menuId,
}) => {
  const theme = useTheme();
  const { getTmdbImageUrl, defaultImageUrl } = useTmdbImageUrl();
  const navigate = useNavigate();

  const [filter, setFilter] = useState("");
  const [folderPathNavigation, setFolderPathNavigation] = useState<string[]>([
    customFolder?.folderPath!,
  ]);

  useEffect(() => {
    setFolderPathNavigation([customFolder?.folderPath!]);
  }, [customFolder?.folderPath]);

  const handlePosterClick = (videoPath: string) => {
    if (!hasExtension(videoPath)) {
      setFolderPathNavigation([...folderPathNavigation, videoPath]);
      refreshCustomFolderData(videoPath || "");
    } else {
      navigate(`/video-details?videoPath=${videoPath}&menuId=${menuId}`);
    }
  };

  const handleBackButtonClick = () => {
    if (folderPathNavigation.length > 1) {
      const newPath = folderPathNavigation.slice(0, -1);
      setFolderPathNavigation(newPath);
      refreshCustomFolderData(newPath[newPath.length - 1]);
    }
  };

  const handleRefresh = () => {
    refreshCustomFolderData(customFolder?.folderPath || "");
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(event.target.value);
  };

  const getFilteredCustomFolderData = () => {
    return customFolderData.filter((data) => {
      const fileNameWithoutExtension = data.fileName!.replace(/\.(mp4|mkv)$/i, "");
      return fileNameWithoutExtension
        .toLowerCase()
        .includes(filter.toLowerCase());
    });
  };

  const renderBreadcrumbs = () => (
    <Box display="flex" justifyContent="center" marginY={1}>
      <Breadcrumbs
        aria-label="breadcrumb"
        separator={<span style={{ color: theme.palette.primary.main }}>/</span>}
      >
        {folderPathNavigation.map((path, index) => (
          <Typography key={path} color="primary">
            {path?.split("/").pop()}
          </Typography>
        ))}
      </Breadcrumbs>
    </Box>
  );

  const renderContent = () => {
    if (loadingCustomFolderData) {
      return <LoadingIndicator message="Loading..." />;
    }

    const filteredData = getFilteredCustomFolderData();
    if (filteredData.length === 0) {
      return (
        <Box display="flex" justifyContent="center" height="100vh" paddingTop="3rem">
          <Box fontSize="2rem">No Videos to display</Box>
        </Box>
      );
    }

    return (
      <CustomFolderDataList
        customFolderData={filteredData}
        handlePosterClick={handlePosterClick}
        getImageUrl={getTmdbImageUrl}
        defaultImageUrl={defaultImageUrl}
      />
    );
  };

  return (
    <Box style={{ ...style, overflowY: "auto" }}>
      {folderPathNavigation.length > 1 && (
        <Button onClick={handleBackButtonClick}>Back</Button>
      )}
      <SearchHeader
        onRefresh={handleRefresh}
        filter={filter}
        onFilterChange={handleFilterChange}
        theme={theme}
      />
      {renderBreadcrumbs()}
      {renderContent()}
    </Box>
  );
};

export { CustomFolder };
