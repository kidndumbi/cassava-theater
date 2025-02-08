import React, {  useEffect, useState } from "react";
import { Box } from "@mui/material";
import { rendererLoggingService as log } from "../../util/renderer-logging.service";

interface PosterCardProps {
  imageUrl: string;
  altText: string;
  onClick?: () => void;
  footer?: React.ReactNode;
}

export const PosterCard: React.FC<PosterCardProps> = ({
  imageUrl,
  altText,
  onClick,
  footer,
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
            width: "200px",
            borderRadius: "10px",
            height: "auto",
            cursor: "pointer",
          }}
        />
      ) : (
        <Box
          onClick={onClick}
          sx={{
            cursor: "pointer",
            width: "200px",
            height: "300px",
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
