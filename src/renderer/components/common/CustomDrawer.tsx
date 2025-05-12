import React from "react";
import { Drawer } from "@mui/material";
import theme from "../../theme";

interface CustomDrawerProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  anchor?: "left" | "right" | "top" | "bottom"; // add anchor prop
}

const CustomDrawer: React.FC<CustomDrawerProps> = ({
  open,
  onClose,
  children,
  anchor = "left", // default to left
}) => {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      anchor={anchor}
      className="custom-scrollbar"
      sx={{
        "& .MuiDrawer-paper": {
          width: "350px",
          backgroundColor: theme.customVariables.appDark,
          color: theme.customVariables.appWhiteSmoke,
        },
      }}
    >
      {children}
    </Drawer>
  );
};

export default CustomDrawer;
