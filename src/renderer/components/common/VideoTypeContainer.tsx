import { Box } from "@mui/material";
import { styled } from "@mui/system";

export const VideoTypeContainer = styled(Box)(
  ({ alwaysShow }: { alwaysShow: boolean }) => ({
    position: "absolute",
    top: 9,
    left: 9,
    display: alwaysShow ? "block" : "none",
    "&.hover-content": {
      display: alwaysShow ? "block" : "none",
    },
  }),
);
