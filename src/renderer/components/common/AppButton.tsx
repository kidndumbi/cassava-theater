import Button from "@mui/material/Button";
import theme from "../../theme";
import React from "react";

interface AppButtonProps {
  children: React.ReactNode;
  disabled: boolean;
  color?: "error" | "primary" | "secondary";
  onClick: () => void;
}

export const AppButton = ({
  children,
  disabled,
  color,
  onClick,
}: AppButtonProps) => (
  <Button
    variant="contained"
    color={color}
    disabled={disabled}
    sx={{
      "&.Mui-disabled": {
        color: theme.customVariables.appWhiteSmoke,
        backgroundColor: "grey",
      },
    }}
    onClick={onClick}
  >
    {children}
  </Button>
);
