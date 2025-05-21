import Button from "@mui/material/Button";
import theme from "../../theme";
import React from "react";

interface AppButtonProps {
  children: React.ReactNode;
  disabled?: boolean;
  color?: "error" | "primary" | "secondary";
  onClick: () => void;
  sx?: object;
}

export const AppButton = ({
  children,
  disabled,
  color,
  onClick,
  sx,
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
      ...sx, // merge in custom sx
    }}
    onClick={onClick}
  >
    {children}
  </Button>
);
