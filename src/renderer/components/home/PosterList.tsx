import { Box } from "@mui/material";
import { ReactNode } from "react";

interface ListProps {
  children: ReactNode;
}

export const PosterList = ({ children }: ListProps) => {
  return (
    <Box className="flex gap-2 overflow-x-auto whitespace-nowrap">
      {children}
    </Box>
  );
};
