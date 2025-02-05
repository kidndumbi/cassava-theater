import React from "react";
import { Box } from "@mui/material";
import { rendererLoggingService as log } from "../../util/renderer-logging.service";

interface PosterCardProps {
  imageUrl: string;
  fallbackUrl: string;
  altText: string;
  onClick: () => void;
  footer?: React.ReactNode;
}

export const PosterCard: React.FC<PosterCardProps> = ({
  imageUrl,
  fallbackUrl,
  altText,
  onClick,
  footer,
}) => {
  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    log.error(
      "Image failed to load, should be displaying fallback image. Video: " +
        altText
    );
    e.currentTarget.src = fallbackUrl;
    const nextSibling = e.currentTarget.nextElementSibling as HTMLElement;
    if (nextSibling) {
      nextSibling.style.display = "block";
    }
  };

  return (
    <Box m={1} flex="1 1 200px" maxWidth="200px">
      <img
        src={imageUrl || fallbackUrl}
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
      {footer}
    </Box>
  );
};
