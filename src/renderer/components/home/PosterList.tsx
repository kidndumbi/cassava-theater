import { Box, IconButton } from "@mui/material";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import theme from "../../theme";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";

interface ListProps {
  children: ReactNode;
}

export const PosterList = ({ children }: ListProps) => {
  const [scrollPosition, setScrollPosition] = useState("beginning");
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      boxRef.current &&
      boxRef.current.scrollWidth <= boxRef.current.clientWidth
    ) {
      setScrollPosition("no-scroll");
    }
  }, [scrollPosition]);

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    if (target.scrollWidth <= target.clientWidth) {
      setScrollPosition("no-scroll");
      return;
    }
    let position = "middle";
    if (target.scrollLeft === 0) {
      position = "beginning";
    } else if (
      Math.abs(target.scrollWidth - target.clientWidth - target.scrollLeft) < 1
    ) {
      position = "end";
    }
    setScrollPosition(position);
  }, []);

  const scrollLeft = () => {
    if (boxRef.current) {
      boxRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (boxRef.current) {
      boxRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  return (
    <Box className="relative">
      <Box
        ref={boxRef}
        className="flex gap-2 whitespace-nowrap"
        onScroll={handleScroll}
        sx={{
          position: "relative",
          overflowX: "auto",
          overflowY: "hidden",
          "&::-webkit-scrollbar": { display: "none" },
          scrollbarWidth: "none",
        }}
      >
        {children}
      </Box>
      {scrollPosition !== "beginning" && scrollPosition !== "no-scroll" && (
        <Box
          className="absolute inset-y-0 left-6 top-32"
          sx={{ zIndex: 10, pointerEvents: "auto", cursor: "pointer" }}
        >
          <IconButton
            onClick={scrollLeft}
            sx={{
              color: theme.customVariables.appWhiteSmoke,
              backgroundColor: `${theme.customVariables.appDark}CC`,
              "&:hover": {
                backgroundColor: `${theme.customVariables.appDark}CC`,
              },
            }}
            className="h-12 w-12"
          >
            <ArrowBackIosNewIcon />
          </IconButton>
        </Box>
      )}
      {scrollPosition !== "end" && scrollPosition !== "no-scroll" && (
        <Box
          className="absolute inset-y-0 right-6 top-32"
          sx={{ zIndex: 10, pointerEvents: "auto", cursor: "pointer" }}
        >
          <IconButton
            onClick={scrollRight}
            sx={{
              color: theme.customVariables.appWhiteSmoke,
              backgroundColor: `${theme.customVariables.appDark}CC`,
              "&:hover": {
                backgroundColor: `${theme.customVariables.appDark}CC`,
              },
            }}
            className="h-12 w-12"
          >
            <ArrowForwardIosIcon />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};