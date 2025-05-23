import React from "react";
import { Box, Button, List } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import { MenuItem } from "../../../models/menu-item.model";
import { MainMenuItem } from "./MainMenuItem";
import buttonStyle from "./buttonStyle";

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
  const handleButtonClick = (item: MenuItem) => {
    onActiveMenuItemChange(item);
    item.handler(item);
  };

  return (
    <>
      <List sx={{ width: "130px", borderRight: "1px solid #ccc" }}>
        {menuItems.map((menu) => (
          <MainMenuItem
            key={menu.label}
            menu={menu}
            activeMenuItem={activeMenuItem}
            handleButtonClick={handleButtonClick}
          />
        ))}

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
    </>
  );
};

export default MainMenu;
