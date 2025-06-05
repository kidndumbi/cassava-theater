import React from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { Clear } from "@mui/icons-material";
import theme from "../../theme";

type FullscreenErrorOverlayProps = {
  icon?: React.ReactNode;
  title: string;
  message: string;
  buttonText?: string;
  onButtonClick: () => void;
  buttonIcon?: React.ReactNode;
  color?: string;
  background?: string;
};

export const FullscreenErrorOverlay: React.FC<FullscreenErrorOverlayProps> = ({
  icon = (
    <Clear sx={{ fontSize: 48, color: theme.palette.error.main, mb: 1 }} />
  ),
  title,
  message,
  buttonText = "Dismiss",
  onButtonClick,
  buttonIcon = <Clear sx={{ mr: 1 }} />,
  color = theme.palette.error.main,
  background = "rgba(20, 20, 20, 0.96)",
}) => (
  <Box
    display="flex"
    flexDirection="column"
    alignItems="center"
    justifyContent="center"
    height="100vh"
    width="100vw"
    position="fixed"
    top={0}
    left={0}
    sx={{
      background,
      zIndex: 2000,
    }}
  >
    <Box
      sx={{
        background: theme.palette.secondary.dark,
        borderRadius: 3,
        boxShadow: 3,
        p: 4,
        minWidth: 320,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {icon}
      <Box
        sx={{
          color: theme.customVariables.appWhiteSmoke,
          fontWeight: 600,
          fontSize: 20,
          mb: 1,
          textAlign: "center",
        }}
      >
        {title}
      </Box>
      <Box
        sx={{
          color: theme.customVariables.appWhiteSmoke,
          mb: 3,
          textAlign: "center",
          fontSize: 16,
        }}
      >
        {message
          ? message.split("\n").map((line, idx) => (
              <React.Fragment key={idx}>
                {line}
                <br />
              </React.Fragment>
            ))
          : null}
      </Box>
      <IconButton
        sx={{
          color,
          border: "1px solid",
          borderColor: color,
          borderRadius: 2,
          px: 3,
          py: 1,
          fontWeight: 600,
          fontSize: 16,
          transition: "background 0.2s",
          "&:hover": {
            background: theme.palette.error.light,
            color: theme.customVariables.appWhiteSmoke,
          },
        }}
        onClick={onButtonClick}
      >
        {buttonIcon}
        {buttonText}
      </IconButton>
    </Box>
  </Box>
);
