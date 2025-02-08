import React from "react";
import { Select, MenuItem, SelectChangeEvent, Theme } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

interface RenderSelectProps<T> {
  value: string;
  onChange: (event: SelectChangeEvent<string>) => void;
  items: T[];
  getItemValue: (item: T) => string;
  getItemLabel: (item: T) => string;
  theme: Theme;
}

const RenderSelect = <T,>({
  value,
  onChange,
  items,
  getItemValue,
  getItemLabel,
  theme,
}: RenderSelectProps<T>) => {
  return (
    <Select
      value={value}
      onChange={onChange}
      style={{ color: theme.customVariables.appWhiteSmoke }}
      IconComponent={(props) => (
        <ArrowDropDownIcon
          {...props}
          style={{ color: theme.customVariables.appWhiteSmoke }}
        />
      )}
      sx={{
        paddingRight: "32px",
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: theme.customVariables.appWhiteSmoke,
        },
        "&:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: theme.customVariables.appWhiteSmoke,
        },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: theme.customVariables.appWhiteSmoke,
        },
      }}
    >
      {items.map((item) => (
        <MenuItem key={getItemValue(item)} value={getItemValue(item)}>
          {getItemLabel(item)}
        </MenuItem>
      ))}
    </Select>
  );
};

export default RenderSelect;
