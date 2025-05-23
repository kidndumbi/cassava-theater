import React from "react";
import { Box } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import theme from "../../theme";
import { useDrop } from "react-dnd";

export const AppDrop: React.FC<{
  allowDrop?: boolean;
  itemDroped: (item: any) => void;
  accept: string[];
  buttonText?: string;
  conatinerStyle?: React.CSSProperties;
  buttonStyle?: React.CSSProperties;
  backgroundColor?: string;
  isOverBackgroundColor?: string;
}> = ({
  allowDrop = true,
  itemDroped,
  accept,
  buttonText = "DELETE",
  conatinerStyle,
  buttonStyle,
  backgroundColor = theme.customVariables.appDarker,
  isOverBackgroundColor = theme.palette.error.main,
}) => {
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
        ...conatinerStyle,
      }}
    >
      <Box
        sx={{
          padding: "10px",
          textAlign: "center",
          color: theme.customVariables.appWhiteSmoke,
          border: `1px solid ${theme.palette.error.main}`,
          borderRadius: "25px",
          backgroundColor: isOver ? isOverBackgroundColor : backgroundColor,
          ...buttonStyle,
        }}
      >
        <DeleteIcon />
        {buttonText}
      </Box>
    </div>
  );
};
