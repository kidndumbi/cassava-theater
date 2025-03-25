import React from "react";
import { Box, CircularProgress, Typography, useTheme } from "@mui/material";

interface LoadingIndicatorProps {
  message?: string;
  showCircularProgress?: boolean;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  message = "Loading...",
  showCircularProgress = true,
}) => {
  const theme = useTheme();
  return (
    <Box className="flex flex-col items-center w-full">
      {showCircularProgress && <CircularProgress />}
      <Typography
        variant="h6"
        className="mt-4"
        sx={{
          color: theme.customVariables.appWhiteSmoke,
        }}
      >
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingIndicator;