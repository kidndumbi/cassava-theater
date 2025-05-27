import React, { useState } from "react";
import { rendererLoggingService as log } from "../../util/renderer-logging.service";
import { Box } from "@mui/material";
import theme from "../../theme";
import { VideoProgressBar } from "./VideoProgressBar";


interface PosterCardProps {
  imageUrl: string;
  altText: string;
  onClick?: () => void;
  footer?: React.ReactNode;
  width?: string;
  height?: string;
  currentTime?: number;
  duration?: number;
}

export const PosterCard: React.FC<PosterCardProps> = ({
  imageUrl,
  altText,
  onClick,
  footer,
  width = "200px",
  height = "300px",
  currentTime,
  duration,
}) => {
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    setHasError(true);
    log.error("Image failed to load. Video:  " + altText);
  };

  return (
    <Box
      className={`m-1 flex flex-col`}
      sx={{ maxWidth: width, minWidth: width }}
    >
      {!hasError && imageUrl ? (
        <Box sx={{ position: "relative", width, height }}>
          <img
            src={imageUrl}
            alt={altText}
            onError={handleError}
            onClick={onClick}
            className="cursor-pointer rounded-lg"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "70% 50%",
              display: "block",
            }}
          />
          {typeof currentTime === "number" && typeof duration === "number" && currentTime > 0 && (
            <Box
              sx={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                px: 1,
                pb: 1,
                zIndex: 2,
              }}
            >
              <VideoProgressBar current={currentTime} total={duration} />
            </Box>
          )}
        </Box>
      ) : (
        <Box
          onClick={onClick}
          className="flex cursor-pointer items-center justify-center rounded-lg text-gray-500"
          sx={{
            width,
            height,
            backgroundColor: theme.palette.primary.main,
            color: theme.customVariables.appWhiteSmoke,
          }}
        >
          Poster Not Available
        </Box>
      )}
      {footer}
    </Box>
  );
};
