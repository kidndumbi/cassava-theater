import React from "react";
import { IconButton, Tooltip, SxProps, Theme } from "@mui/material";

interface AppIconButtonProps {
  tooltip: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  className?: string;
  sx?: SxProps<Theme>;
}

const buttonStyles: SxProps<Theme> = {
  color: (theme) => theme.customVariables.appWhite,
  backgroundColor: (theme) => `${theme.customVariables.appDark}CC`, // 80% opacity
  "&:hover": {
    backgroundColor: (theme) => `${theme.customVariables.appGray}CC`,
  },
  width: 48,
  height: 48,
};

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
          ...buttonStyles,
          ...sx,
        }}
      >
        {children}
      </IconButton>
    </Tooltip>
  );
};

export default React.memo(AppIconButton);
