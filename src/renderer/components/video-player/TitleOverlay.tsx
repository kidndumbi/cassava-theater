
import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import theme from "../../theme";
import { removeVidExt } from "../../util/helperFunctions";

type TitleOverlayProps = {
  fileName?: string;
};

const TitleOverlay: React.FC<TitleOverlayProps> = ({ fileName }) => {
  return (
    <Box
      sx={{
        position: "absolute",
        top: "20px",
        left: "20px",
        color: "white",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        padding: "5px 10px",
        borderRadius: "5px",
      }}
    >
      <Typography
        variant="h5"
        component="div"
        sx={{
          padding: "8px 0",
          fontWeight: "bold",
          color: theme.customVariables.appWhite,
        }}
      >
        {removeVidExt(fileName)}
      </Typography>
    </Box>
  );
};

export default TitleOverlay;