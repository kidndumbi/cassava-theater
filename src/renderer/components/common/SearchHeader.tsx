import React from "react";
import { Box, Theme } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { AppTextField } from "./AppTextField";
import AddIcon from "@mui/icons-material/Add";
import AppIconButton from "./AppIconButton";

interface SearchHeaderProps {
  onRefresh: () => void;
  filter: string;
  onFilterChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  theme: Theme;
  styles?: React.CSSProperties;
  addTvShow?: () => void;
}

export const SearchHeader: React.FC<SearchHeaderProps> = ({
  onRefresh,
  filter,
  onFilterChange,
  theme,
  styles,
  addTvShow,
}) => {
  return (
    <Box className="flex items-center justify-between" style={styles}>
      <Box className="flex gap-2">
        <AppIconButton tooltip="Refresh" onClick={onRefresh}>
          <RefreshIcon />
        </AppIconButton>
        {addTvShow && (
          <AppIconButton tooltip="Add TV Show Folder" onClick={addTvShow}>
            <AddIcon />
          </AppIconButton>
        )}
      </Box>

      <Box className="w-[30%]">
        <AppTextField label="Search" value={filter} onChange={onFilterChange} theme={theme} />
      </Box>
    </Box>
  );
};
