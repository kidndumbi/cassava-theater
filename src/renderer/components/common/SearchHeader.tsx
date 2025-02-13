import React from "react";
import { Box, IconButton, Theme } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { renderTextField } from "./RenderTextField";

interface SearchHeaderProps {
  onRefresh: () => void;
  filter: string;
  onFilterChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  theme: Theme;
  styles?: React.CSSProperties;
}

export const SearchHeader: React.FC<SearchHeaderProps> = ({
  onRefresh,
  filter,
  onFilterChange,
  theme,
  styles,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        ...styles,
      }}
    >
      <IconButton
        sx={{
          color: theme.customVariables.appWhite,
          width: 48,
          height: 48,
        }}
        onClick={onRefresh}
      >
        <RefreshIcon />
      </IconButton>
      <Box sx={{ width: "30%" }}>
        {renderTextField("Search", filter, onFilterChange, theme)}
      </Box>
    </Box>
  );
};
