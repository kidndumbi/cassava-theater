import React from "react";
import { IconButton, Tooltip } from "@mui/material";
import theme from "../../theme";

interface AppIconButtonProps {
  tooltip: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  className?: string;
  sx?: object;
}

const AppIconButton: React.FC<AppIconButtonProps> = ({
  tooltip,
  onClick,
  children,
  className = "",
  sx,
}) => {
  return (
    <Tooltip title={tooltip}>
      <IconButton
        className={className}
        onClick={onClick}
        sx={{
          color: theme.customVariables.appWhite,
          width: 48,
          height: 48,
          ...sx,
        }}
      >
        {children}
      </IconButton>
    </Tooltip>
  );
};

export default AppIconButton;
