import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
} from "@mui/material";
import theme from "../../theme";
import { useEffect, useRef } from "react";
import { DragPreviewImage, useDrag, useDrop } from "react-dnd";
import { useDragPreviewImage } from "../../hooks/useDragPreviewImage";

export interface DragMenuItem {
  index: number;
  type: string;
  menuItem: { id: string; name: string };
}

function AppListPanelItem({
  menuItem,
  selected,
  onClick,
  idx,
  dragging,
  onSwitchPosition,
}: {
  menuItem: { id: string; name: string };
  selected: boolean;
  onClick: () => void;
  idx: number;
  dragging?: (isDragging: boolean, idx: number) => void;
  onSwitchPosition?: (id1: string, id2: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isOver, canDrop }, drop] = useDrop<
    DragMenuItem,
    void,
    { isOver: boolean; canDrop: boolean }
  >({
    accept: "MENUITEM",
    canDrop: () => onSwitchPosition !== undefined,
    drop(item) {
      if (item.index === idx) return;
      onSwitchPosition?.(menuItem.id, item.menuItem.id);
      item.index = idx;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  });

  const [{ isDragging }, drag, dragPreview] = useDrag({
    type: "MENUITEM",
    item: {
      index: idx,
      type: "MENUITEM",
      menuItem,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const previewSrc = useDragPreviewImage(menuItem.name);

  useEffect(() => {
    dragging?.(isDragging, idx);
  }, [isDragging, dragging, idx]);

  drag(drop(ref));

  return (
    <>
      <DragPreviewImage connect={dragPreview} src={previewSrc} />
      <div ref={ref}>
        <ListItem
          key={menuItem.id}
          disablePadding
          sx={{
            ...(isOver &&
              canDrop && {
                borderTop: `2px solid ${theme.customVariables.appWhiteSmoke}`,
              }),
          }}
        >
          <ListItemButton
            selected={selected}
            onClick={onClick}
            sx={{
              color: theme.customVariables.appWhiteSmoke,
              "&.Mui-selected": {
                backgroundColor: theme.palette.primary.dark,
                color: theme.customVariables.appWhiteSmoke,
              },
              "&:hover": {
                backgroundColor: theme.palette.primary.light,
                color: theme.customVariables.appWhiteSmoke,
              },
            }}
          >
            <ListItemText
              primary={menuItem.name}
              slotProps={{
                primary: {
                  sx: { color: theme.customVariables.appWhiteSmoke },
                },
              }}
            />
          </ListItemButton>
        </ListItem>
      </div>
    </>
  );
}

interface AppListPanelProps {
  items: { id: string; name: string }[] | undefined;
  selectedItem: { id: string; name: string } | null;
  setSelectedItem: (item: { id: string; name: string }) => void;
  backgroundColor?: string;
  dragging?: (isDragging: boolean, idx: number) => void;
  onSwitchPosition?: (id1: string, id2: string) => void;
}

export const AppListPanel = ({
  items,
  selectedItem,
  setSelectedItem,
  backgroundColor = theme.customVariables.appDark,
  dragging,
  onSwitchPosition,
}: AppListPanelProps) => {
  return (
    <Paper
      sx={{
        minWidth: 220,
        maxWidth: 300,
        flex: "0 0 220px",
        backgroundColor,
      }}
    >
      <List
        sx={{
          color: theme.customVariables.appWhiteSmoke,
          bgcolor: backgroundColor,
        }}
      >
        {items?.map((item, index) => (
          <AppListPanelItem
            key={item.id}
            idx={index}
            menuItem={item}
            selected={selectedItem?.id === item.id}
            onClick={() => setSelectedItem(item)}
            dragging={dragging}
            onSwitchPosition={onSwitchPosition}
          />
        ))}
      </List>
    </Paper>
  );
};
