import React, { useState } from "react";
import { Box } from "@mui/material";
import { rendererLoggingService as log } from "../../util/renderer-logging.service";

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
    <Box m={1} flex="1 1 200px" maxWidth="200px">
      {!hasError && imageUrl ? (
        <img
          src={imageUrl}
          alt={altText}
          onError={handleError}
          onClick={onClick}
          style={{
            width,
            height,
            borderRadius: "10px",
            cursor: "pointer",
          }}
        />
      ) : (
        <Box
          onClick={onClick}
          sx={{
            cursor: "pointer",
            width,
            height,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "gray",
          }}
        >
          Poster Not Available
        </Box>
      )}
      {footer}
    </Box>
  );
};
