import React from "react";
import { Box, IconButton } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { renderTextField } from "./RenderTextField";


interface SearchHeaderProps {
  onRefresh: () => void;
  filter: string;
  onFilterChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  theme: any;
}

export const SearchHeader: React.FC<SearchHeaderProps> = ({
  onRefresh,
  filter,
  onFilterChange,
  theme,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      <IconButton
        sx={{
          position: "absolute",
          left: 0,
          color: theme.customVariables.appWhite,
          width: 48,
          height: 48,
        }}
        onClick={onRefresh}
      >
        <RefreshIcon />
      </IconButton>
      <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
        {renderTextField("Search", filter, onFilterChange, theme)}
      </Box>

    </Box>
  );
};
