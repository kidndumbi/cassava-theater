import React, { createContext, useContext, useState, ReactNode } from "react";
import { Snackbar, Alert, Button } from "@mui/material";

type SnackbarSeverity = "success" | "error";

interface SnackbarContextProps {
  showSnackbar: (
    message: string,
    severity: SnackbarSeverity,
    actionText?: string,
    onAction?: () => void
  ) => void;
}

const SnackbarContext = createContext<SnackbarContextProps | undefined>(
  undefined
);

export const SnackbarProvider = ({ children }: { children: ReactNode }) => {
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: SnackbarSeverity;
    actionText?: string;
    onAction?: () => void;
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = (
    message: string,
    severity: SnackbarSeverity,
    actionText?: string,
    onAction?: () => void
  ) => {
    setSnackbar({ open: true, message, severity, actionText, onAction });
  };

  const handleClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <SnackbarContext.Provider value={{ showSnackbar }}>
      {children}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert onClose={handleClose} severity={snackbar.severity} action={
          snackbar.actionText ? (
            <Button color="inherit" size="small" onClick={() => {
              if (snackbar.onAction) snackbar.onAction();
              handleClose();
            }}>
              {snackbar.actionText}
            </Button>
          ) : null
        }>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error("useSnackbar must be used within a SnackbarProvider");
  }
  return context;
};
