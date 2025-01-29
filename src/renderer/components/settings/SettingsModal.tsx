import React from "react";
import { AppBar, IconButton, Toolbar, Typography, Dialog } from "@mui/material";
// import { SettingsPage } from "./SettingsPage";
import CloseIcon from "@mui/icons-material/Close";
import theme from "../../theme";
import { SettingsPage } from "./SettingsPage";

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  open,
  onClose,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      PaperProps={{
        style: {
          backgroundColor: theme.customVariables.appDarker,
        },
      }}
    >
      <>
        <AppBar sx={{ position: "relative" }}>
          <Toolbar>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Settings
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

        <SettingsPage />
      </>
    </Dialog>
  );
};
