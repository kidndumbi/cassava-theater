import React, { useState } from "react";
import { Box, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { VideoDataModel } from "../../../models/videoData.model";

import { TvShowsList } from "./TvShowsList";

import LoadingIndicator from "../common/LoadingIndicator";
import { SearchHeader } from "../common/SearchHeader";
import { AppModal } from "../common/AppModal";
import { AddTvShowFolder } from "./addTvShow/AddTvShowFolder";

interface TvShowsProps {
  tvShows: VideoDataModel[];
  style?: React.CSSProperties;
  refreshTvShows: () => void;
  loadingTvShows: boolean;
  menuId: string;
}

export const TvShows: React.FC<TvShowsProps> = ({
  tvShows,
  style,
  refreshTvShows,
  loadingTvShows,
  menuId,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [filter, setFilter] = useState("");
  const [openAddTvShowModal, setOpenAddTvShowModal] = useState(false);

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(event.target.value);
  };

  const filteredTvShows = tvShows.filter((show) => {
    return show.fileName?.toLowerCase().includes(filter.toLowerCase()) ?? false;
  });

  const handlePosterClick = (videoPath: string) => {
    navigate(`/video-details?videoPath=${videoPath}&menuId=${menuId}`);
  };

  const handleRefresh = () => {
    refreshTvShows();
  };

  return (
    <Box style={{ ...style, overflowY: "auto" }}>
      <SearchHeader
        onRefresh={handleRefresh}
        filter={filter}
        onFilterChange={handleFilterChange}
        theme={theme}
        addTvShow={() => setOpenAddTvShowModal(true)}
      />

      {loadingTvShows ? (
        <LoadingIndicator message="Loading TV Shows..." />
      ) : filteredTvShows.length === 0 ? (
        <Box
          display="flex"
          justifyContent="center"
          height="100vh"
          paddingTop="3rem"
        >
          <Box fontSize="2rem">No TV Shows to display</Box>
        </Box>
      ) : (
        <TvShowsList
          shows={filteredTvShows}
          handlePosterClick={handlePosterClick}
        />
      )}

      <AppModal
        open={openAddTvShowModal}
        onClose={() => setOpenAddTvShowModal(false)}
        title="Add TV Show Folder"
        fullScreen={true}
      >
        <AddTvShowFolder />
      </AppModal>
    </Box>
  );
};
