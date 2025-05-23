import React from "react";
import { Box, Button } from "@mui/material";
import { MenuItem } from "../../../models/menu-item.model";
import theme from "../../theme";
import buttonStyle from "./buttonStyle";

export const MainMenuItem = ({
  menu,
  activeMenuItem,
  handleButtonClick,
}: {
  menu: MenuItem;
  activeMenuItem: MenuItem;
  handleButtonClick: (item: MenuItem) => void;
}) => {
  const isActive = menu.label === activeMenuItem.label;
  const activeStyle = isActive
    ? { backgroundColor: theme.palette.primary.main }
    : {};

  const icon =
    isActive && menu.menuType === "default" && React.isValidElement(menu.icon)
      ? React.cloneElement(menu.icon, {
          sx: {
            ...(typeof (menu.icon as any).props?.sx === "object"
              ? { ...(menu.icon as any).props.sx }
              : {}),
            color: theme.customVariables.appWhiteSmoke,
          },
        } as any)
      : menu.icon;

  return (
    <Button
      key={menu.label}
      style={{
        ...buttonStyle,
        ...activeStyle,
        borderTopRightRadius: "0px",
        borderBottomRightRadius: "0px",
      }}
      onClick={() => handleButtonClick(menu)}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        {icon}
        <span>{menu.label}</span>
      </Box>
    </Button>
  );
};
