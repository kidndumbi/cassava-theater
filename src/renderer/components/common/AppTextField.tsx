import React from "react";
import { TextField, Theme } from "@mui/material";
import "./RenderTextField.css";

interface RenderTextFieldProps {
  label: string;
  value: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  theme: Theme;
  readOnly?: boolean;
}

export const AppTextField = ({
  label,
  value,
  onChange,
  theme,
  readOnly = false,
}: RenderTextFieldProps) => {
  const textFieldStyles = {
    inputLabel: { style: { color: theme.customVariables.appWhiteSmoke } },
    input: {
      style: { color: theme.customVariables.appWhiteSmoke },
      readOnly,
    },
  };

  const sxStyles = {
    "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.customVariables.appWhiteSmoke,
    },
    "&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.customVariables.appWhiteSmoke,
    },
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: theme.customVariables.appWhiteSmoke,
    },
  };

  return (
    <TextField
      className="textField-root"
      label={label}
      value={value}
      onChange={onChange}
      margin="normal"
      fullWidth
      slotProps={textFieldStyles}
      sx={sxStyles}
    />
  );
};
