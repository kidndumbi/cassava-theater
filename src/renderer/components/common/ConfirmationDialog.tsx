import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import Button from "@mui/material/Button";
import React from "react";
import theme from "../../theme";

type ConfirmationDialogProps = {
  open: boolean;
  message: React.ReactNode;
  handleClose: (choice: string) => void;
  procedButtonText?: string;
  hideOkButton?: boolean;
};

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  message,
  handleClose,
  procedButtonText = "Ok",
  hideOkButton = false,
}) => {
  return (
    <Dialog
      open={open}
      onClose={() => handleClose("Cancel")}
      slotProps={{
        paper: {
          style: { backgroundColor: theme.customVariables.appDarker },
        },
      }}
    >
      <DialogContent>
        <DialogContentText
          component="div" // fixed to avoid <div> nested within <p>
          style={{ color: theme.customVariables.appWhiteSmoke }}
        >
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleClose("Cancel")} color="primary">
          Cancel
        </Button>
        {!hideOkButton && (
          <Button onClick={() => handleClose("Ok")} color="primary">
            {procedButtonText}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
