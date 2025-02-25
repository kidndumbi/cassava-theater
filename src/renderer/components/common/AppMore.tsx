import React from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import IconButton from "@mui/material/IconButton";
import { Tooltip, Menu, MenuItem } from "@mui/material";
import theme from "../../theme";

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
      <Tooltip title="more options">
        <IconButton
          sx={{
            left: 0,
            color: theme.customVariables.appWhiteSmoke,
            width: 48,
            height: 48,
          }}
          onClick={handleClick}
        >
          <MoreVertIcon />
        </IconButton>
      </Tooltip>
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
