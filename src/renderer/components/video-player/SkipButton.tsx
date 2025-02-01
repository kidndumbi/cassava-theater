import React from "react";
import IconButton from "@mui/material/IconButton";
import theme from "../../theme";

type SkipButtonProps = {
  skip: (seconds: number) => void;
  seconds: number;
  IconComponent: any;
  label: string;
};

const SkipButton: React.FC<SkipButtonProps> = ({
  skip,
  seconds,
  IconComponent,
  label,
}) => {
  const buttonStyles = {
    color: theme.customVariables.appWhite,
    width: 48,
    height: 48,
  };
  const iconStyles = { fontSize: 40 };

  return (
    <IconButton
      sx={buttonStyles}
      aria-label={label}
      onClick={() => skip(seconds)}
    >
      <IconComponent sx={iconStyles} />
    </IconButton>
  );
};

export default SkipButton;