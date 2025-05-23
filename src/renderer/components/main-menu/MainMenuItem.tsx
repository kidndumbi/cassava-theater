import React from "react";
import { Box, Button } from "@mui/material";
import { useDrag, useDrop } from "react-dnd";
import { MenuItem } from "../../../models/menu-item.model";
import theme from "../../theme";
import buttonStyle from "./buttonStyle";

interface DragItem {
  index: number;
  type: string;
  menu: MenuItem;
}

export const MainMenuItem = ({
  menu,
  idx,
  activeMenuItem,
  handleButtonClick,
  switchCustomFolderPosition,
}: {
  menu: MenuItem;
  idx: number;
  activeMenuItem: MenuItem;
  handleButtonClick: (item: MenuItem) => void;
  switchCustomFolderPosition: (id1: string, id2: string) => void;
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

  const ref = React.useRef<HTMLDivElement>(null);

  const [{ isOver, canDrop }, drop] = useDrop<DragItem, void, { isOver: boolean, canDrop:boolean }>({
    accept: "MENUITEM",
    canDrop: () => menu.menuType !== "default",
    drop(item) {
      const waitingItemId = menu.id;
      const droppedItemId = item.menu.id;
      if (item.index === idx) return;
      switchCustomFolderPosition(waitingItemId, droppedItemId);
      item.index = idx;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  });

  const [{ opacity,isDragging }, drag] = useDrag({
    type: "MENUITEM",
    item: { index: idx, type: "MENUITEM", menu },
    canDrag: () => menu.menuType !== "default",
    collect: (monitor) => ({
      opacity: monitor.isDragging() ? 0.5 : 1,
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      style={{
        opacity,
        cursor: "move",
        border: isOver && canDrop
          ? `2px solid ${theme.palette.primary.main}`
          : "2px solid transparent",
        borderRadius: 8,
        transition: "border-color 0.2s",
      } as React.CSSProperties}
    >
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
    </div>
  );
};
