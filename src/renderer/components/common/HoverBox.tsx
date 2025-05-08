import { Box } from "@mui/material";
import { styled } from "@mui/system";

export const HoverBox = styled(Box)({
  position: "relative",
  "&:hover .hover-content": {
    display: "block",
  },
});
