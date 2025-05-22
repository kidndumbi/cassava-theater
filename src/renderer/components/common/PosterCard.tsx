import React, { useState } from "react";
import { rendererLoggingService as log } from "../../util/renderer-logging.service";
import { Box } from "@mui/material";
import theme from "../../theme";

interface PosterCardProps {
  imageUrl: string;
  altText: string;
  onClick?: () => void;
  footer?: React.ReactNode;
  width?: string;
  height?: string;
}

export const PosterCard: React.FC<PosterCardProps> = ({
  imageUrl,
  altText,
  onClick,
  footer,
  width = "200px",
  height = "300px",
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
        <img
          src={imageUrl}
          alt={altText}
          onError={handleError}
          onClick={onClick}
          className="cursor-pointer rounded-lg"
          style={{
            width,
            height,
            objectFit: "cover",
            objectPosition: "70% 50%",
          }}
        />
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
