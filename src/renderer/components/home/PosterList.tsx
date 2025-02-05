import { Box } from "@mui/material";
import { ReactNode } from "react";

interface ListProps {
  children: ReactNode;
}

export const PosterList = ({ children }: ListProps) => {
  return (
    <Box
      display="flex"
      gap="8px"
      sx={{ maxWidth: "calc(100vw - 30px)", overflowY: "auto" }}
    >
      {children}
    </Box>
  );
};
