import React from "react";
import { Box, Typography } from "@mui/material";

interface PosterCardProps {
  imageUrl: string;
  fallbackUrl: string;
  altText: string;
  onClick: () => void;
  label?: string;
}

export const PosterCard: React.FC<PosterCardProps> = ({
  imageUrl,
  fallbackUrl,
  altText,
  onClick,
  label,
}) => {
  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = "none";
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
        style={{ width: "100%", borderRadius: "10px", cursor: "pointer" }}
      />
      <Typography variant="subtitle1" align="center">
        {label}
      </Typography>
    </Box>
  );
};
