import React from "react";
import Typography from "@mui/material/Typography";
import theme from "../../theme";

interface TitleProps {
  children: React.ReactNode;
}

export const Title: React.FC<TitleProps> = ({ children }) => (
  <Typography
    variant="h6"
    gutterBottom
    sx={{
      color: theme.customVariables.appWhiteSmoke,
      fontWeight: "bold",
    }}
  >
    {children}
  </Typography>
);
