import React, { ElementType } from "react";

import AppIconButton from "../common/AppIconButton";

type SkipButtonProps = {
  skip: (seconds: number) => void;
  seconds: number;
  IconComponent: ElementType;
  label: string;
};

const SkipButton: React.FC<SkipButtonProps> = ({
  skip,
  seconds,
  IconComponent,
  label,
}) => {
  return (
    <AppIconButton
      tooltip=""
      onClick={() => skip(seconds)}
      aria-label={label}
    >
      <IconComponent sx={{ fontSize: 40 }} />
    </AppIconButton>
  );
};

export default SkipButton;
