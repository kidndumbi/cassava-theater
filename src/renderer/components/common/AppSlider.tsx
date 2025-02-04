import React from "react";
import Slider from "@mui/material/Slider";

interface AppSliderProps {
  value: number;
  onChange: (event: Event, newValue: number | number[]) => void;
  min?: number;
  max?: number;
  step?: number;
}

export const AppSlider: React.FC<AppSliderProps> = ({
  value,
  onChange,
  min = 0,
  max,
  step = 1,
}) => {
  return (
    <Slider
      value={value}
      size="small"
      onChange={onChange}
      min={min}
      max={max}
      step={step}
      style={{ width: "100%", margin: 0, padding: 0 }} // Added to remove all padding and margin
    />
  );
};
