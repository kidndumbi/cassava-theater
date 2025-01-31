import React from "react";
import { Box, CircularProgress, Typography, useTheme } from "@mui/material";

interface LoadingIndicatorProps {
  message?: string;
  showCircularProgress?: boolean;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  message,
  showCircularProgress = true,
}) => {
  const theme = useTheme();
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      width="100%"
    >
      {showCircularProgress && <CircularProgress />}
      <Typography
        variant="h6"
        sx={{
          marginTop: "16px",
          color: theme.customVariables.appWhiteSmoke,
        }}
      >
        {message || "Loading..."}
      </Typography>
    </Box>
  );
};

export default LoadingIndicator;