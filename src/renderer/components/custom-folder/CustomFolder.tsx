import React, { useState } from "react";
import { VideoDataModel } from "../../../models/videoData.model";
import { Box, useTheme, Typography } from "@mui/material";
import { SearchHeader } from "../common/SearchHeader";
import LoadingIndicator from "../common/LoadingIndicator";
import { useTmdbImageUrl } from "../../hooks/useImageUrl";
import { useNavigate } from "react-router-dom";
import { CustomFolderModel } from "../../../models/custom-folder";
import { CustomFolderDataList } from "./CustomFolderDataList";
import { removeVidExt } from "../../util/helperFunctions";

interface CustomFolderProps {
  customFolderData: VideoDataModel[];
  loadingCustomFolderData: boolean;
  style?: React.CSSProperties;
  customFolder: CustomFolderModel | null;
  menuId: string;
  refetchCustomFolder: () => void;
}

const CustomFolder: React.FC<CustomFolderProps> = ({
  style,
  customFolderData,
  loadingCustomFolderData,
  customFolder,
  menuId,
  refetchCustomFolder,
}) => {
  const theme = useTheme();
  const { getTmdbImageUrl } = useTmdbImageUrl();
  const navigate = useNavigate();

  const [filter, setFilter] = useState("");

  const handlePosterClick = (videoPath: string) => {
    navigate(`/video-details?videoPath=${videoPath}&menuId=${menuId}`);
  };

  const handleRefresh = () => {
    refetchCustomFolder();
  };

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(event.target.value);
  };

  const getFilteredCustomFolderData = () => {
    return customFolderData?.filter((data) => {
      const fileNameWithoutExtension = data.fileName
        ? removeVidExt(data.fileName)
        : "";
      return fileNameWithoutExtension
        .toLowerCase()
        .includes(filter.toLowerCase());
    });
  };

  const renderContent = () => {
    if (loadingCustomFolderData) {
      return <LoadingIndicator />;
    }

    const filteredData = getFilteredCustomFolderData();
    if (filteredData?.length === 0) {
      return (
        <div className="flex h-screen justify-center pt-12">
          <div className="text-2xl">No Videos to display</div>
        </div>
      );
    }

    return (
      <CustomFolderDataList
        customFolder={customFolder}
        customFolderData={filteredData}
        handlePosterClick={handlePosterClick}
        getImageUrl={getTmdbImageUrl}
      />
    );
  };

  return (
    <Box style={{ ...style, overflowY: "auto" }}>
      <SearchHeader
        onRefresh={handleRefresh}
        filter={filter}
        onFilterChange={handleFilterChange}
        theme={theme}
      />
      <Box className="pb-3">
        <Typography color="primary">{customFolder?.folderPath}</Typography>
      </Box>

      {renderContent()}
    </Box>
  );
};

export { CustomFolder };
