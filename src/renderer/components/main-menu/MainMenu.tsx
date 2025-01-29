import React from "react";
import { Button, List, useTheme } from "@mui/material";

import SettingsIcon from "@mui/icons-material/Settings";
import { MenuItem } from "../../../models/menu-item.model";

interface MainMenuProps {
  menuItems: MenuItem[];
  activeMenuItem: MenuItem;
  onActiveMenuItemChange: (menuItem: MenuItem) => void;
  onSettingsClick: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({
  menuItems,
  activeMenuItem,
  onActiveMenuItemChange,
  onSettingsClick
}) => {
  const theme = useTheme();

  const buttonStyle = {
    backgroundColor: theme.customVariables.appDarker,
    color: theme.customVariables.appWhiteSmoke,
    boxShadow: "none",
    border: "none",
    marginBottom: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
  };

  const labelStyle = { marginLeft: "10px" };

  const handleButtonClick = (item: MenuItem) => {
    onActiveMenuItemChange(item);
    item.handler(item);
  };

  return (
    <List>
      {menuItems.map((item) => {
        const isActive = item.label === activeMenuItem.label;
        const activeStyle = isActive
          ? { backgroundColor: theme.palette.primary.main }
          : {};
        return (
          <Button
            key={item.label}
            style={{ ...buttonStyle, ...activeStyle }}
            onClick={() => handleButtonClick(item)}
          >
            {item.icon && item.icon}
            <span style={labelStyle}>{item.label}</span>
          </Button>
        );
      })}
      <Button style={{ ...buttonStyle }} onClick={onSettingsClick}>
        <SettingsIcon />
        <span style={labelStyle}>Settings</span>
      </Button>
    </List>
  );
};

export default MainMenu;
