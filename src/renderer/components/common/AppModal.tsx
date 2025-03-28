import React from "react";
import { AppBar, IconButton, Toolbar, Typography, Dialog } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import theme from "../../theme";

interface AppModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  fullScreen?: boolean; // New prop to control fullscreen behavior
}

export const AppModal: React.FC<AppModalProps> = ({
  open,
  onClose,
  title,
  children,
  fullScreen = false, // Default value set to false
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen} // Use the new prop here
      slotProps={{
        paper: {
          style: {
            backgroundColor: theme.customVariables.appDarker,
          },
        },
      }}
    >
      <AppBar sx={{ position: "relative" }}>
        <Toolbar>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            {title}
          </Typography>
          <IconButton
            edge="start"
            color="inherit"
            onClick={onClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {children}
    </Dialog>
  );
};
