import { Select, MenuItem, SelectChangeEvent } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import theme from "../../theme";

interface RenderSelectProps<T> {
  value: string;
  onChange: (event: SelectChangeEvent<string>) => void;
  items: T[];
  getItemValue: (item: T) => string;
  getItemLabel: (item: T) => string;
}

const RenderSelect = <T,>({
  value,
  onChange,
  items,
  getItemValue,
  getItemLabel,
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
      MenuProps={{
        PaperProps: {
          sx: {
            backgroundColor: theme.customVariables.appDarker,
            "& .MuiMenuItem-root": {
              color: theme.customVariables.appWhiteSmoke,
              "&:hover": {
                backgroundColor: theme.customVariables.appDark,
              },
            },
          },
        },
      }}
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
