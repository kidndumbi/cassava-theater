import React from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {  Menu, MenuItem } from "@mui/material";
import theme from "../../theme";
import AppIconButton from "./AppIconButton";

interface AppMoreProps {
  handleDelete: () => void;
}

export const AppMore: React.FC<AppMoreProps> = ({ handleDelete }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <AppIconButton
        tooltip="more options"
        onClick={handleClick}
        className="left-0"
        sx={{
          color: theme.customVariables.appWhiteSmoke,
          width: "30px",
          height: "30px",
          backgroundColor: theme.customVariables.appDark,
          "&:hover": {
            backgroundColor: theme.customVariables.appDark,
          },
        }}
      >
        <MoreVertIcon />
      </AppIconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
        sx={{
          "& .MuiPaper-root": {
            backgroundColor: theme.customVariables.appDark,
          },
        }}
      >
        <MenuItem
          onClick={() => {
            handleDelete();
            handleClose();
          }}
          sx={{ color: theme.palette.error.main }}
        >
          Delete
        </MenuItem>
        <MenuItem
          onClick={handleClose}
          sx={{ color: theme.customVariables.appWhiteSmoke }}
        >
          My account
        </MenuItem>
        <MenuItem
          onClick={handleClose}
          sx={{ color: theme.customVariables.appWhiteSmoke }}
        >
          Logout
        </MenuItem>
      </Menu>
    </>
  );
};
