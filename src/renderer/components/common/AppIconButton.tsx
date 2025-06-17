import React from "react";
import {
  IconButton,
  Tooltip,
  SxProps,
  Theme,
  IconButtonProps,
} from "@mui/material";

interface AppIconButtonProps
  extends Omit<IconButtonProps, "onClick" | "children"> {
  tooltip: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  sx?: SxProps<Theme>;
}

const buttonStyles: SxProps<Theme> = {
  color: (theme) => theme.customVariables.appWhite,
  backgroundColor: (theme) => `${theme.customVariables.appDark}CC`, // 80% opacity
  "&:hover": {
    backgroundColor: (theme) => `${theme.customVariables.appGray}CC`,
  },
  "&:disabled": {
    color: (theme) => `${theme.customVariables.appGray}`,
  },
  width: 48,
  height: 48,
};

const AppIconButton: React.FC<AppIconButtonProps> = ({
  tooltip,
  onClick,
  children,
  disabled,
  className = "",
  sx,
  ...iconButtonProps
}) => {
  return (
    <Tooltip title={tooltip}>
      <IconButton
        className={className}
        onClick={(event) => {
          if (onClick) {
            onClick(event);
          }
        }}
        disabled={disabled}
        sx={{
          ...buttonStyles,
          ...sx,
        }}
        {...iconButtonProps}
      >
        {children}
      </IconButton>
    </Tooltip>
  );
};

export default React.memo(AppIconButton);
