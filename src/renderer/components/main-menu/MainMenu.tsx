import React from "react";
import { Box, Button, List, useTheme } from "@mui/material";

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
  onSettingsClick,
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
    justifyContent: "center",
    width: "100%",
  };

  const handleButtonClick = (item: MenuItem) => {
    onActiveMenuItemChange(item);
    item.handler(item);
  };

  return (
    <List sx={{ width: "130px", borderRight: "1px solid #ccc" }}>
      {menuItems.map((item) => {
        const isActive = item.label === activeMenuItem.label;
        const activeStyle = isActive
          ? { backgroundColor: theme.palette.primary.main }
          : {};
        return (
          <Button
            key={item.label}
            style={{
              ...buttonStyle,
              ...activeStyle,
              borderTopRightRadius: "0px",
              borderBottomRightRadius: "0px",
            }}
            onClick={() => handleButtonClick(item)}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
              }}
            >
              {item.icon && item.icon}
              <span>{item.label}</span>
            </Box>
          </Button>
        );
      })}
      <Button style={{ ...buttonStyle }} onClick={onSettingsClick}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <SettingsIcon />
          <span>Settings</span>
        </Box>
      </Button>
    </List>
  );
};

export default MainMenu;
