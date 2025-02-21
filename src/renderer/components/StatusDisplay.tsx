import { Box } from "@mui/material";
import theme from "../theme";

const StatusDisplayItem = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box
      sx={{
        padding: "0 10px",
        margin: 0,
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "inherit",
        "&:hover": {
          backgroundColor: theme.palette.primary.light,
        },
      }}
    >
      {children}
    </Box>
  );
};

interface StatusDisplayProps {
  port: string | undefined;
}

export const StatusDisplay = ({ port }: StatusDisplayProps) => {
  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: "30px",
        backgroundColor: theme.palette.primary.main,
        color: theme.customVariables.appWhiteSmoke,
        display: "flex",
        alignItems: "center",
        fontSize: "1rem",
        padding: "0",
        borderTop: `1px solid ${theme.palette.primary.dark}`,
      }}
    >
      <StatusDisplayItem>PORT: {port} </StatusDisplayItem>
    </Box>
  );
};
