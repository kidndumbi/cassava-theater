import { Box, Menu, MenuItem, SxProps, Theme } from "@mui/material";
import React from "react";
import theme from "../../theme";

export interface ContextMenuItemConfig {
  label: string;
  action: () => void;
  sx?: SxProps<Theme>;
}

interface AppContextMenuProps {
  children: React.ReactNode;
  menuItems?: ContextMenuItemConfig[];
  title?: string;
}

export const AppContextMenu = ({
  children,
  menuItems,
  title,
}: AppContextMenuProps) => {
  const [contextMenu, setContextMenu] = React.useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);

  const menuPaperStyles: SxProps<Theme> = {
    "& .MuiPaper-root": {
      backgroundColor: theme.customVariables.appDark,
    },
  };

  const menuItemStyles = (color?: string): SxProps<Theme> => ({
    color: color || theme.customVariables.appWhiteSmoke,
  });

  return (
    <>
      <Box
        onContextMenu={(event) => {
          // console.log("Context menu event target", event.target);
          event.preventDefault();
          setContextMenu(
            contextMenu === null
              ? {
                  mouseX: event.clientX + 2,
                  mouseY: event.clientY - 6,
                }
              : null,
          );
        }}
      >
        {children}
      </Box>
      <Menu
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : null
        }
        open={contextMenu !== null}
        onClose={() => setContextMenu(null)}
        sx={menuPaperStyles}
      >
        {title && (
          <MenuItem
            disabled
            sx={{
              opacity: 1,
              fontWeight: "bold",
              pointerEvents: "none",
              color: theme.customVariables.appWhiteSmoke,
            }}
          >
            {title}
          </MenuItem>
        )}
        {menuItems?.map((item, index) => (
          <MenuItem
            key={index}
            onClick={() => {
              item.action();
              setContextMenu(null);
            }}
            sx={item.sx ? item.sx : menuItemStyles()}
          >
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
