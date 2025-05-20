import React from "react";
import { Box } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import theme from "../../theme";
import { useDrop } from "react-dnd";

export const AppDelete: React.FC<{
  allowDrop?: boolean;
  itemDroped: (item: any) => void;
  accept?: string[];
}> = ({ allowDrop = true, itemDroped, accept }) => {
  const ref = React.useRef<HTMLDivElement>(null);

  const [{ isOver }, drop] = useDrop({
    accept,
    canDrop: () => allowDrop,
    drop(item) {
      itemDroped(item);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  });

  drop(ref);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        top: "10px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 2000,
      }}
    >
      <Box
        sx={{
          padding: "10px",
          textAlign: "center",
          color: theme.customVariables.appWhiteSmoke,
          border: `1px solid ${theme.palette.error.main}`,
          borderRadius: "25px",
          backgroundColor: isOver
            ? theme.palette.error.main
            : theme.customVariables.appDarker,
        }}
      >
        <DeleteIcon />
        DELETE
      </Box>
    </div>
  );
};
