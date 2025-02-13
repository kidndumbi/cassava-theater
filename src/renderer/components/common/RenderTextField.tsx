import React from "react";
import { TextField, Theme } from "@mui/material";
import "./RenderTextField.css";

export const renderTextField = (
  label: string,
  value: string,
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void,
  theme: Theme
) => (
  <TextField
    className="textField-root"
    label={label}
    value={value}
    onChange={onChange}
    margin="normal"
    fullWidth
    slotProps={{
      inputLabel: { style: { color: theme.customVariables.appWhiteSmoke } },
      input: { style: { color: theme.customVariables.appWhiteSmoke }, readOnly: false },
    }}
    sx={{
      "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.customVariables.appWhiteSmoke,
      },
      "&:hover .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.customVariables.appWhiteSmoke,
      },
      "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: theme.customVariables.appWhiteSmoke,
      },
    }}
  />
);
